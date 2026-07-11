package com.vlt.ecommerce.feature.order;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vlt.ecommerce.common.dto.PageResponse;
import com.vlt.ecommerce.common.event.OrderStatusChangedEvent;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.cart.CartItem;
import com.vlt.ecommerce.feature.cart.CartItemRepository;
import com.vlt.ecommerce.feature.commission.CommissionService;
import com.vlt.ecommerce.feature.order.dto.response.OrderResponse;
import com.vlt.ecommerce.feature.payment.Payment;
import com.vlt.ecommerce.feature.payment.Payment.PaymentMethod;
import com.vlt.ecommerce.feature.payment.Payment.PaymentStatus;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;
import com.vlt.ecommerce.feature.shop.Shop;
import com.vlt.ecommerce.feature.shop.repository.ShopRepository;
import com.vlt.ecommerce.feature.user.Address;
import com.vlt.ecommerce.feature.user.Role;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.dto.response.AddressResponse;
import com.vlt.ecommerce.feature.user.mapper.AddressMapper;
import com.vlt.ecommerce.feature.user.repository.AddressRepository;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class OrderService {
    CommissionService commissionService;
    OrderRepository orderRepository;
    CartItemRepository cartItemRepository;
    UserRepository userRepository;
    AddressRepository addressRepository;
    ShopRepository shopRepository;
    ProductRepository productRepository;
    AddressMapper addressMapper;
    OrderMapper orderMapper;
    ObjectMapper objectMapper;
    ApplicationEventPublisher eventPublisher;

    @PreAuthorize("hasRole('BUYER')")
    @Transactional
    public List<OrderResponse> create(OrderRequest request) {
        User buyer = getCurrentUser();

        List<CartItem> cartItems = cartItemRepository.findByBuyerId(buyer.getId());
        if (cartItems.isEmpty()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!address.getUser().getId().equals(buyer.getId())) {
            throw new AppException(ErrorCode.INVALID_ADDRESS);
        }

        // convert string addreson json
        String addressSnapshot;
        try {
            AddressResponse addressDto = addressMapper.toAddressResponse(address);
            addressSnapshot = objectMapper.writeValueAsString(addressDto);
        } catch (JsonProcessingException e) {
            throw new AppException(ErrorCode.SYSTEM_ERROR);
        }

        Map<Long, List<CartItem>> itemsByShop = cartItems.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getShop().getId()));

        List<Order> createdOrders = new ArrayList<>();

        for (Map.Entry<Long, List<CartItem>> entry : itemsByShop.entrySet()) {
            List<CartItem> shopItems = entry.getValue();

            Shop shop = shopRepository.findById(entry.getKey())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

            Order newOrder = orderMapper.toOrder(request);
            newOrder.setBuyer(buyer);
            newOrder.setShop(shop);
            newOrder.setAddressSnapshot(addressSnapshot);
            newOrder.setNote(request.getNote());
            //Gắn khóa chống trùng lặp (Kết hợp UUID của FE và ID của Shop)
            if (request.getIdempotencyKey() != null) {
                newOrder.setIdempotencyKey(request.getIdempotencyKey() + "-shop" + shop.getId());
            }
            newOrder.setItems(new ArrayList<>());
            newOrder.setTotalAmount(BigDecimal.ZERO);

            BigDecimal totalAmount = BigDecimal.ZERO;

            for (CartItem shopItem : shopItems) {
                Product product = shopItem.getProduct();
                int orderQuantity = shopItem.getQuantity();

                // if (product.getStockQuantity() < orderQuantity) {
                //     throw new AppException(ErrorCode.OUT_OF_STOCK);
                // }
                // product.setStockQuantity(product.getStockQuantity() - orderQuantity);
                // product.setSoldCount(product.getSoldCount() + orderQuantity);

                // 1. XÓA BỎ kiểm tra in-memory cũ.
                // 2. Chạy lệnh Atomic Update dưới DB và lấy ra số dòng cập nhật thành công
                int updatedRows = productRepository.decrementStockAndIncrementSold(product.getId(), orderQuantity);

                // 3. Nếu trả về 0 -> Không có dòng nào thỏa mãn điều kiện stock_quantity >= qty -> BÁO LỖI HẾT HÀNG
                if (updatedRows == 0) {
                    throw new AppException(ErrorCode.OUT_OF_STOCK);
                }

                BigDecimal itemTotalPrice = product.getPrice().multiply(BigDecimal.valueOf(orderQuantity));

                OrderItem orderItem = OrderItem.builder()
                        .order(newOrder)
                        .product(product)
                        .shop(product.getShop())
                        .productName(product.getName())
                        .productPrice(product.getPrice())
                        .quantity(orderQuantity)
                        .totalPrice(itemTotalPrice)
                        .build();

                newOrder.getItems().add(orderItem);
                totalAmount = totalAmount.add(itemTotalPrice);
            }

            newOrder.setTotalAmount(totalAmount);
            Order savedOrder = orderRepository.save(newOrder);
            createdOrders.add(savedOrder);
            eventPublisher.publishEvent(new OrderStatusChangedEvent(this, savedOrder.getId()));
        }

        cartItemRepository.deleteAllByBuyerId(buyer.getId());
        return orderMapper.toOrderResponses(createdOrders);
    }

    @Transactional
    @PreAuthorize("hasRole('SELLER')")
    public OrderResponse confirmOrder(Long id) {
        User seller = getCurrentUser();

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        Shop shop = shopRepository.findBySellerId(seller.getId());
        if (shop == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        boolean isOwner = order.getItems().stream()
                .anyMatch(item -> item.getShop().getId().equals(shop.getId()));

        if (!isOwner) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        order.setStatus(OrderStatus.CONFIRMED);

        eventPublisher.publishEvent(new OrderStatusChangedEvent(this, order.getId()));
        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    @PreAuthorize("hasRole('SELLER')")
    public OrderResponse shipOrder(Long id) {
        User seller = getCurrentUser();

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        Shop shop = shopRepository.findBySellerId(seller.getId());
        if (shop == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        boolean isOwner = order.getItems().stream()
                .anyMatch(item -> item.getShop().getId().equals(shop.getId()));

        if (!isOwner) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        order.setStatus(OrderStatus.SHIPPING);
        eventPublisher.publishEvent(new OrderStatusChangedEvent(this, order.getId()));
        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public OrderResponse completeOrder(Long id) {
        User buyer = getCurrentUser();

        // Order order = orderRepository.findById(id)
        //         .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Order order = orderRepository.findByIdForUpdate(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        order.setStatus(OrderStatus.COMPLETED);
        commissionService.calculateCommission(order);
        eventPublisher.publishEvent(new OrderStatusChangedEvent(this, order.getId()));
        return orderMapper.toOrderResponse(order);
    }

    @PreAuthorize("hasRole('BUYER')")
    public PageResponse<OrderResponse> getOwnHistoryOrder(int page, int size) {
        User buyer = getCurrentUser();

        // Sắp xếp đơn hàng mới nhất lên đầu
        Pageable pageable = PageRequest.of(page-1, size, Sort.by("createdAt").descending());

        // Gọi database (Đã chặn N+1 query bằng EntityGraph)
        Page<Order> orderPage = orderRepository.findByBuyerId(buyer.getId(), pageable);

        List<OrderResponse> content = orderMapper.toOrderResponses(orderPage.getContent());

        return PageResponse.of(orderPage, content);
    }

    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public OrderResponse getDetailOrder(Long id) {
        User user = getCurrentUser();

        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (user.getRole() == Role.BUYER && !order.getBuyer().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        } 
        
        if (user.getRole() == Role.SELLER && !order.getShop().getSeller().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return orderMapper.toOrderResponse(order);
    }

    //huy hang
    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public OrderResponse cancelOrder(Long id) {
        User buyer = getCurrentUser();

        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (!order.getStatus().equals(OrderStatus.PENDING)) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }
     
        order.setStatus(OrderStatus.CANCELLED);

        Payment payment = order.getPayment();
        if (payment != null && payment.getStatus() == PaymentStatus.PAID) {
            if (payment.getMethod() == PaymentMethod.MOCK_ONLINE || 
                payment.getMethod() == PaymentMethod.BANK_TRANSFER) {
                
                payment.setStatus(PaymentStatus.REFUNDED); 
                payment.setTransactionRef("REFUND_MOCK_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()); // Mã hoàn tiền giả
            }
        }

        // for (OrderItem item : order.getItems()) {
        //     Product product = item.getProduct();
        //     product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
        //     product.setSoldCount(product.getSoldCount() - item.getQuantity());
        // }

        for (OrderItem item : order.getItems()) {
            productRepository.restoreStockAndDecrementSold(item.getProduct().getId(), item.getQuantity());
        }
        
        eventPublisher.publishEvent(new OrderStatusChangedEvent(this, order.getId()));
        return orderMapper.toOrderResponse(order);
    }

    @PreAuthorize("hasRole('SELLER')")
    public PageResponse<OrderResponse> getSellerOrders(int page, int size) {
        User seller = getCurrentUser();

        Shop shop = shopRepository.findBySellerId(seller.getId());
        if (shop == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        Pageable pageable = PageRequest.of(page-1, size, Sort.by("order.createdAt").descending());
        Page<Order> orderPage = orderRepository.findByShopId(shop.getId(), pageable);

        List<OrderResponse> content = orderMapper.toOrderResponses(orderPage.getContent());

        return PageResponse.of(orderPage, content);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }
}
