package com.vlt.ecommerce.feature.order;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.cart.CartItem;
import com.vlt.ecommerce.feature.cart.CartItemRepository;
import com.vlt.ecommerce.feature.commission.CommissionService;
import com.vlt.ecommerce.feature.order.dto.response.OrderItemResponse;
import com.vlt.ecommerce.feature.order.dto.response.OrderResponse;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.shop.Shop;
import com.vlt.ecommerce.feature.shop.repository.ShopRepository;
import com.vlt.ecommerce.feature.user.Address;
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
    OrderItemRepository orderItemRepository;
    CartItemRepository cartItemRepository;
    UserRepository userRepository;
    AddressRepository addressRepository;
    ShopRepository shopRepository;
    AddressMapper addressMapper;
    OrderMapper orderMapper;
    OrderItemMapper orderItemMapper;
    ObjectMapper objectMapper;

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
            newOrder.setItems(new ArrayList<>());
            newOrder.setTotalAmount(BigDecimal.ZERO);

            BigDecimal totalAmount = BigDecimal.ZERO;

            for (CartItem shopItem : shopItems) {
                Product product = shopItem.getProduct();
                int orderQuantity = shopItem.getQuantity();

                if (product.getStockQuantity() < orderQuantity) {
                    throw new AppException(ErrorCode.OUT_OF_STOCK);
                }
                product.setStockQuantity(product.getStockQuantity() - orderQuantity);
                product.setSoldCount(product.getSoldCount() + orderQuantity);

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
            createdOrders.add(orderRepository.save(newOrder));
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

        // TODO (Sprint 5)code gui notifi
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
        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public OrderResponse completeOrder(Long id) {
        User buyer = getCurrentUser();

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        order.setStatus(OrderStatus.COMPLETED);
        // TODO (Sprint 4): Gọi CommissionService để tính phí hoa hồng và ghi nhận doanh thu
        commissionService.calculateCommission(order);
        return orderMapper.toOrderResponse(order);
    }

    @PreAuthorize("hasRole('BUYER')")
    public PageResponse<OrderResponse> getMyOrders(int page, int size) {
        User buyer = getCurrentUser();

        // Sắp xếp đơn hàng mới nhất lên đầu
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // Gọi database (Đã chặn N+1 query bằng EntityGraph)
        Page<Order> orderPage = orderRepository.findByBuyerId(buyer.getId(), pageable);

        List<OrderResponse> content = orderMapper.toOrderResponses(orderPage.getContent());

        return PageResponse.of(orderPage, content);
    }

    @PreAuthorize("hasRole('SELLER')")
    public PageResponse<OrderItemResponse> getSellerOrders(int page, int size) {
        User seller = getCurrentUser();

        Shop shop = shopRepository.findBySellerId(seller.getId());
        if (shop == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("order.createdAt").descending());
        Page<OrderItem> orderItemPage = orderItemRepository.findByShopId(shop.getId(), pageable);

        List<OrderItemResponse> content = orderItemMapper.toOrderItemResponses(orderItemPage.getContent());

        return PageResponse.of(orderItemPage, content);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }
}
