package com.vlt.ecommerce.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.vlt.ecommerce.domain.Order;
import com.vlt.ecommerce.domain.OrderItem;
import com.vlt.ecommerce.domain.enumeration.OrderStatus;
import com.vlt.ecommerce.service.OrderService;
import com.vlt.ecommerce.config.Constants;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.domain.event.OrderStatusChangedEvent;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.config.properties.OrderProperties;
import com.vlt.ecommerce.domain.CartItem;
import com.vlt.ecommerce.repository.CartItemRepository;
import com.vlt.ecommerce.service.CommissionCalculator;
import com.vlt.ecommerce.service.dto.request.OrderRequest;
import com.vlt.ecommerce.service.dto.response.OrderResponse;
import com.vlt.ecommerce.service.mapper.OrderItemMapper;
import com.vlt.ecommerce.service.mapper.OrderMapper;
import com.vlt.ecommerce.repository.OrderRepository;
import com.vlt.ecommerce.domain.Payment;
import com.vlt.ecommerce.domain.Payment.PaymentMethod;
import com.vlt.ecommerce.domain.Payment.PaymentStatus;
import com.vlt.ecommerce.domain.SpecificProduct;
import com.vlt.ecommerce.repository.ProductRepository;
import com.vlt.ecommerce.repository.SpecificProductRepository;
import com.vlt.ecommerce.repository.ReviewRepository;
import com.vlt.ecommerce.domain.Shop;
import com.vlt.ecommerce.repository.ShopRepository;
import com.vlt.ecommerce.domain.Address;
import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.service.dto.response.AddressResponse;
import com.vlt.ecommerce.service.mapper.AddressMapper;
import com.vlt.ecommerce.repository.AddressRepository;

import com.vlt.ecommerce.security.CurrentUserProvider;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    CurrentUserProvider currentUserProvider;
    CommissionCalculator commissionCalculator;
    OrderRepository orderRepository;
    ReviewRepository reviewRepository;
    CartItemRepository cartItemRepository;
    AddressRepository addressRepository;
    ShopRepository shopRepository;
    ProductRepository productRepository;
    SpecificProductRepository specificProductRepository;
    AddressMapper addressMapper;
    OrderMapper orderMapper;
    OrderItemMapper orderItemMapper;
    ObjectMapper objectMapper;
    ApplicationEventPublisher eventPublisher;
    RabbitTemplate rabbitTemplate;
    OrderProperties orderProperties;

    @Override
    @Transactional
    public List<OrderResponse> createOrders(OrderRequest request) {
        User buyer = currentUserProvider.getUser();
        List<CartItem> cartItems = findSelectedCartItems(request.getCartItemIds(), buyer.getId());
        List<Order> createdOrders = createOrdersByShop(request, buyer, cartItems);

        cartItemRepository.deleteAll(cartItems);
        return orderMapper.toOrderResponses(createdOrders);
    }

    private List<Order> createOrdersByShop(OrderRequest request, User buyer, List<CartItem> cartItems) {
        String addressSnapshot = snapshotShippingAddress(request.getAddressId(), buyer.getId());
        Map<Long, List<CartItem>> itemsByShop = cartItems.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getShop().getId()));

        List<Order> createdOrders = new ArrayList<>();
        for (Map.Entry<Long, List<CartItem>> shopItems : itemsByShop.entrySet()) {
            Shop shop = shopRepository.findById(shopItems.getKey())
                    .orElseThrow(() -> new AppException(ErrorCode.SHOP_NOT_FOUND));
            Order order = orderMapper.toShopOrder(request, buyer, shop);
            order.setAddressSnapshot(addressSnapshot);
            createdOrders.add(placeShopOrder(order, shopItems.getValue()));
        }
        return createdOrders;
    }

    private List<CartItem> findSelectedCartItems(List<Long> cartItemIds, Long buyerId) {
        List<CartItem> cartItems = cartItemRepository.findAllByIdInAndBuyerId(cartItemIds, buyerId);
        if (cartItems.isEmpty() || cartItems.size() != cartItemIds.size()) {
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }
        return cartItems;
    }

    private String snapshotShippingAddress(Long addressId, Long buyerId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));
        if (!address.getUser().getId().equals(buyerId)) {
            throw new AppException(ErrorCode.INVALID_ADDRESS);
        }

        try {
            AddressResponse addressDto = addressMapper.toAddressResponse(address);
            return objectMapper.writeValueAsString(addressDto);
        } catch (JsonProcessingException e) {
            throw new AppException(ErrorCode.SYSTEM_ERROR);
        }
    }

    private Order placeShopOrder(Order order, List<CartItem> cartItems) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            reserveStock(cartItem);
            OrderItem orderItem = orderItemMapper.toOrderItem(order, cartItem);
            order.getItems().add(orderItem);
            totalAmount = totalAmount.add(orderItem.getTotalPrice());
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        eventPublisher.publishEvent(new OrderStatusChangedEvent(this, savedOrder.getId()));
        sendOrderExpirationSchedule(savedOrder.getId());
        return savedOrder;
    }

    private void reserveStock(CartItem cartItem) {
        SpecificProduct variant = cartItem.getSpecificProduct();
        int quantity = cartItem.getQuantity();
        if (variant != null && specificProductRepository.decrementStock(variant.getId(), quantity) == 0) {
            throw new AppException(ErrorCode.OUT_OF_STOCK);
        }
        if (productRepository.decrementStockAndIncrementSold(cartItem.getProduct().getId(), quantity) == 0) {
            throw new AppException(ErrorCode.OUT_OF_STOCK);
        }
    }

    private void sendOrderExpirationSchedule(Long orderId) {
        int orderExpirationTtlMs = orderProperties.expirationTtlMs();
        try {
            rabbitTemplate.convertAndSend(
                    Constants.ORDER_DELAY_EXCHANGE,
                    Constants.ORDER_DELAY_ROUTING_KEY,
                    orderId,
                    message -> {
                        message.getMessageProperties().setExpiration(String.valueOf(orderExpirationTtlMs));
                        return message;
                    }
            );
            String durationStr = (orderExpirationTtlMs < 60000)
                    ? (orderExpirationTtlMs / 1000) + " giây"
                    : (orderExpirationTtlMs < 3600000)
                    ? (orderExpirationTtlMs / 60000) + " phút"
                    : (orderExpirationTtlMs / 3600000) + " giờ";
            log.info("Đã lên lịch tự động hủy đơn hàng #{} sau {} qua RabbitMQ TTL",
                    orderId, durationStr);
        } catch (Exception e) {
            log.warn("Không thể lên lịch tự động hủy cho đơn hàng #{}: {}", orderId, e.getMessage());
        }
    }

    @Override
    @Transactional
    public OrderResponse confirmOrder(Long id) {
        return transitionSellerOrder(id, OrderStatus.PENDING, OrderStatus.CONFIRMED);
    }

    @Override
    @Transactional
    public OrderResponse shipOrder(Long id) {
        return transitionSellerOrder(id, OrderStatus.CONFIRMED, OrderStatus.SHIPPING);
    }

    private OrderResponse transitionSellerOrder(Long id, OrderStatus expectedStatus, OrderStatus nextStatus) {
        User seller = currentUserProvider.getUser();
        Order order = findOrderForUpdate(id);
        if (order.getStatus() != expectedStatus) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        Shop shop = shopRepository.findBySellerId(seller.getId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOP_NOT_FOUND));
        boolean isOwner = order.getItems().stream()
                .anyMatch(item -> item.getShop().getId().equals(shop.getId()));
        if (!isOwner) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Payment payment = order.getPayment();
        if (expectedStatus == OrderStatus.PENDING && payment != null
                && payment.getMethod() == PaymentMethod.ZALOPAY && payment.getStatus() != PaymentStatus.PAID) {
            throw new AppException(ErrorCode.WALLET_PAYMENT_REQUIRED);
        }

        order.setStatus(nextStatus);
        eventPublisher.publishEvent(new OrderStatusChangedEvent(this, order.getId()));
        return orderMapper.toOrderResponse(order);
    }

    // Lock the order before validating transitions to prevent duplicate cancellation and stock restoration.
    private Order findOrderForUpdate(Long id) {
        return orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    private Order findBuyerOrderForUpdate(Long id) {
        User buyer = currentUserProvider.getUser();
        Order order = findOrderForUpdate(id);
        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return order;
    }

    @Override
    @Transactional
    public OrderResponse completeOrder(Long id) {
        Order order = findBuyerOrderForUpdate(id);

        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        order.setStatus(OrderStatus.COMPLETED);
        commissionCalculator.calculateCommission(order);
        eventPublisher.publishEvent(new OrderStatusChangedEvent(this, order.getId()));
        return orderMapper.toOrderResponse(order);
    }

    @Override
    public PageResponse<OrderResponse> getOwnHistoryOrder(int page, int size, OrderStatus status) {
        User buyer = currentUserProvider.getUser();

        Pageable pageable = PageRequest.of(page-1, size, Sort.by("createdAt").descending());

        Page<Order> orderPage;
        if (status == null) {
            orderPage = orderRepository.findByBuyerId(buyer.getId(), pageable);
        } else {
            orderPage = orderRepository.findByBuyerIdAndStatus(buyer.getId(), status, pageable);
        }

        List<OrderResponse> content = orderMapper.toOrderResponses(orderPage.getContent());

        content.forEach(res -> res.setReviewed(reviewRepository.existsByOrderId(res.getId())));

        return PageResponse.of(orderPage, content);
    }

    @Override
    public OrderResponse getDetailOrder(Long id) {
        Long userId = currentUserProvider.getUserId();

        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        boolean isBuyer = order.getBuyer() != null && order.getBuyer().getId().equals(userId);
        boolean isSeller = order.getShop() != null && order.getShop().getSeller() != null
                && order.getShop().getSeller().getId().equals(userId);
        boolean canReadAny = currentUserProvider.hasAuthority(Constants.AUTHORITY_ORDER_READ_ANY);

        if (!isBuyer && !isSeller && !canReadAny) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return orderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long id) {
        Order order = findBuyerOrderForUpdate(id);

        if (!order.getStatus().equals(OrderStatus.PENDING)) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        Payment payment = order.getPayment();
        if (payment != null && payment.getMethod() == PaymentMethod.ZALOPAY
                && (payment.getStatus() == PaymentStatus.PAID
                || (payment.getStatus() == PaymentStatus.PENDING && payment.getGatewayOrderId() != null))) {
            throw new AppException(ErrorCode.WALLET_PAYMENT_IN_PROGRESS);
        }

        order.setStatus(OrderStatus.CANCELLED);
        if (payment != null && payment.getStatus() == PaymentStatus.PAID) {
            if (payment.getMethod() == PaymentMethod.MOCK_ONLINE ||
                payment.getMethod() == PaymentMethod.BANK_TRANSFER) {

                payment.setStatus(PaymentStatus.REFUNDED);
                payment.setTransactionRef("REFUND_MOCK_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            }
        }

        for (OrderItem item : order.getItems()) {
            if (item.getSpecificProduct() != null) {
                specificProductRepository.incrementStock(item.getSpecificProduct().getId(), item.getQuantity());
            }
            productRepository.restoreStockAndDecrementSold(item.getProduct().getId(), item.getQuantity());
        }

        eventPublisher.publishEvent(new OrderStatusChangedEvent(this, order.getId()));
        return orderMapper.toOrderResponse(order);
    }

    @Override
    public PageResponse<OrderResponse> getSellerOrders(int page, int size, OrderStatus status) {
        User seller = currentUserProvider.getUser();

        Shop shop = shopRepository.findBySellerId(seller.getId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOP_NOT_FOUND));

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<Order> orderPage;
        if (status == null) {
            orderPage = orderRepository.findByShopId(shop.getId(), pageable);
        } else {
            orderPage = orderRepository.findByShopIdAndStatus(shop.getId(), status, pageable);
        }

        List<OrderResponse> content = orderMapper.toOrderResponses(orderPage.getContent());

        return PageResponse.of(orderPage, content);
    }
}
