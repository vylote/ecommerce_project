package com.vlt.ecommerce.feature.order;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.experimental.NonFinal;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vlt.ecommerce.common.dto.PageResponse;
import com.vlt.ecommerce.common.event.OrderStatusChangedEvent;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.config.RabbitMQConfig;
import com.vlt.ecommerce.feature.cart.CartItem;
import com.vlt.ecommerce.feature.cart.CartItemRepository;
import com.vlt.ecommerce.feature.commission.CommissionService;
import com.vlt.ecommerce.feature.order.dto.request.OrderRequest;
import com.vlt.ecommerce.feature.order.dto.response.OrderResponse;
import com.vlt.ecommerce.feature.order.dto.response.OrderStatusStat;
import com.vlt.ecommerce.feature.order.dto.response.SellerAnalyticsResponse;
import com.vlt.ecommerce.feature.order.mapper.OrderMapper;
import com.vlt.ecommerce.feature.order.repository.OrderRepository;
import com.vlt.ecommerce.feature.payment.Payment;
import com.vlt.ecommerce.feature.payment.Payment.PaymentMethod;
import com.vlt.ecommerce.feature.payment.Payment.PaymentStatus;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.SpecificProduct;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;
import com.vlt.ecommerce.feature.product.repository.SpecificProductRepository;
import com.vlt.ecommerce.feature.shop.Shop;
import com.vlt.ecommerce.feature.shop.repository.ShopRepository;
import com.vlt.ecommerce.feature.user.Address;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.dto.response.AddressResponse;
import com.vlt.ecommerce.feature.user.mapper.AddressMapper;
import com.vlt.ecommerce.feature.user.repository.AddressRepository;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import com.vlt.ecommerce.feature.review.ReviewRepository;

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
    ReviewRepository reviewRepository;
    CartItemRepository cartItemRepository;
    UserRepository userRepository;
    AddressRepository addressRepository;
    ShopRepository shopRepository;
    ProductRepository productRepository;
    SpecificProductRepository specificProductRepository;
    AddressMapper addressMapper;
    OrderMapper orderMapper;
    ObjectMapper objectMapper;
    ApplicationEventPublisher eventPublisher;
    RabbitTemplate rabbitTemplate;
    @NonFinal
    @Value("${app.order.expiration-ttl-ms:900000}")
    int orderExpirationTtlMs;

    @PreAuthorize("hasRole('BUYER')")
    @Transactional
    public List<OrderResponse> create(OrderRequest request) {
        User buyer = getCurrentUser();

        List<CartItem> cartItems = cartItemRepository.findAllByIdInAndBuyerId(request.getCartItemIds(), buyer.getId());
        if (cartItems.isEmpty() || cartItems.size() != request.getCartItemIds().size()) {
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
                SpecificProduct variant = shopItem.getSpecificProduct();
                int orderQuantity = shopItem.getQuantity();

                if (variant != null) {
                    int variantUpdated = specificProductRepository.decrementStock(variant.getId(), orderQuantity);
                    if (variantUpdated == 0) {
                        throw new AppException(ErrorCode.OUT_OF_STOCK);
                    }
                }

                int updatedRows = productRepository.decrementStockAndIncrementSold(product.getId(), orderQuantity);

                if (updatedRows == 0) {
                    throw new AppException(ErrorCode.OUT_OF_STOCK);
                }

                BigDecimal unitPrice = (variant != null) ? variant.getPrice() : product.getPrice();
                BigDecimal itemTotalPrice = unitPrice.multiply(BigDecimal.valueOf(orderQuantity));

                String itemImage = null;
                if (variant != null && variant.getImageUrl() != null && !variant.getImageUrl().isBlank()) {
                    itemImage = variant.getImageUrl();
                } else if (product.getImages() != null && !product.getImages().isEmpty()) {
                    itemImage = product.getImages().stream()
                        .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                        .map(img -> img.getUrl())
                        .findFirst()
                        .orElse(product.getImages().get(0).getUrl());
                }

                String itemName = product.getName();
                if (variant != null && variant.getName() != null && !variant.getName().isBlank()) {
                    itemName = itemName + " - " + variant.getName();
                }

                OrderItem orderItem = OrderItem.builder()
                        .order(newOrder)
                        .product(product)
                        .specificProduct(variant)
                        .shop(product.getShop())
                        .productName(itemName)
                        .productPrice(unitPrice)
                        .quantity(orderQuantity)
                        .totalPrice(itemTotalPrice)
                        .productImageUrl(itemImage)
                        .build();

                newOrder.getItems().add(orderItem);
                totalAmount = totalAmount.add(itemTotalPrice);
            }

            newOrder.setTotalAmount(totalAmount);
            Order savedOrder = orderRepository.save(newOrder);
            createdOrders.add(savedOrder);
            eventPublisher.publishEvent(new OrderStatusChangedEvent(this, savedOrder.getId()));

            // Lên lịch tự động hủy đơn sau 15 phút nếu khách không thanh toán
            sendOrderExpirationSchedule(savedOrder.getId());
        }

        cartItemRepository.deleteAll(cartItems); 
        return orderMapper.toOrderResponses(createdOrders);
    }

    private void sendOrderExpirationSchedule(Long orderId) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ORDER_DELAY_EXCHANGE,
                    RabbitMQConfig.ORDER_DELAY_ROUTING_KEY,
                    orderId,
                    message -> {
                        // Thiết lập thời gian sống (TTL) linh hoạt theo từng message lấy từ cấu hình
                        message.getMessageProperties().setExpiration(String.valueOf(orderExpirationTtlMs));
                        return message;
                    }
            );
            String durationStr = (orderExpirationTtlMs < 60000)
                    ? (orderExpirationTtlMs / 1000) + " giây"
                    : (orderExpirationTtlMs < 3600000)
                    ? (orderExpirationTtlMs / 60000) + " phút"
                    : (orderExpirationTtlMs / 3600000) + " giờ";
            log.info("⏰ Đã lên lịch tự động hủy đơn hàng #{} sau {} qua RabbitMQ TTL",
                    orderId, durationStr);
        } catch (Exception e) {
            log.warn("Không thể lên lịch tự động hủy cho đơn hàng #{}: {}", orderId, e.getMessage());
        }
    }

    @Transactional
    @PreAuthorize("hasRole('SELLER')")
    public OrderResponse confirmOrder(Long id) {
        User seller = getCurrentUser();

        // Sử dụng khóa bi quan (Pessimistic Lock) để chống xung đột race condition giữa Seller xác nhận và Buyer hủy đơn
        Order order = orderRepository.findByIdForUpdate(id)
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

        Order order = orderRepository.findByIdForUpdate(id)
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
    public PageResponse<OrderResponse> getOwnHistoryOrder(int page, int size, OrderStatus status) {
        User buyer = getCurrentUser();

        // Sắp xếp đơn hàng mới nhất lên đầu
        Pageable pageable = PageRequest.of(page-1, size, Sort.by("createdAt").descending());

        Page<Order> orderPage;
        if (status == null) {
            orderPage = orderRepository.findByBuyerId(buyer.getId(), pageable);
        } else {
            orderPage = orderRepository.findByBuyerIdAndStatus(buyer.getId(), status, pageable);
        }

        List<OrderResponse> content = orderMapper.toOrderResponses(orderPage.getContent());
        
        // Kiểm tra xem đơn hàng đã được đánh giá chưa
        content.forEach(res -> res.setReviewed(reviewRepository.existsByOrderId(res.getId())));

        return PageResponse.of(orderPage, content);
    }

    @PreAuthorize("hasAnyRole('BUYER', 'SELLER', 'ADMIN')")
    public OrderResponse getDetailOrder(Long id) {
        User user = getCurrentUser();

        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        boolean isBuyer = order.getBuyer() != null && order.getBuyer().getId().equals(user.getId());
        boolean isSeller = order.getShop() != null && order.getShop().getSeller() != null 
                && order.getShop().getSeller().getId().equals(user.getId());
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));

        if (!isBuyer && !isSeller && !isAdmin) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return orderMapper.toOrderResponse(order);
    }

    //huy hang
    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public OrderResponse cancelOrder(Long id) {
        User buyer = getCurrentUser();

        // Sử dụng khóa bi quan (Pessimistic Lock) để chống hủy đơn kép và hoàn lặp tồn kho
        Order order = orderRepository.findByIdForUpdate(id)
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

        for (OrderItem item : order.getItems()) {
            if (item.getSpecificProduct() != null) {
                specificProductRepository.incrementStock(item.getSpecificProduct().getId(), item.getQuantity());
            }
            productRepository.restoreStockAndDecrementSold(item.getProduct().getId(), item.getQuantity());
        }
        
        eventPublisher.publishEvent(new OrderStatusChangedEvent(this, order.getId()));
        return orderMapper.toOrderResponse(order);
    }

    @PreAuthorize("hasRole('SELLER')")
    public PageResponse<OrderResponse> getSellerOrders(int page, int size, OrderStatus status) {
        User seller = getCurrentUser();

        Shop shop = shopRepository.findBySellerId(seller.getId());
        if (shop == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

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

    @PreAuthorize("hasRole('SELLER')")
    public Map<OrderStatus, Long> getDashboardStats() {
        User seller = getCurrentUser();
        Shop shop = shopRepository.findBySellerId(seller.getId());
        if (shop == null) throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);

        List<OrderStatusStat> stats = orderRepository.countOrdersByStatusForShop(shop.getId());
        // Chuyển List thành Map để Frontend dễ hiển thị (VD: { "PENDING": 12, "SHIPPING": 5 })
        Map<OrderStatus, Long> result = new EnumMap<>(OrderStatus.class);
        for (OrderStatus status : OrderStatus.values()) {
            result.put(status, 0L);
        }
        for (OrderStatusStat stat : stats) {
            result.put(stat.getStatus(), stat.getCount());
        }
        return result;
    }

    @PreAuthorize("hasRole('SELLER')")
    public SellerAnalyticsResponse getSellerAnalytics(String periodType, int range) {
        User seller = getCurrentUser();
        Shop shop = shopRepository.findBySellerId(seller.getId());
        if (shop == null) throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);

        String period = (periodType == null || periodType.isBlank()) ? "DAY" : periodType.toUpperCase();
        LocalDate today = LocalDate.now();
        LocalDateTime startDate;
        
        switch (period) {
            case "WEEK" -> {
                int weeks = (range <= 0 || range > 52) ? 8 : range;
                startDate = today.minusWeeks(weeks - 1).with(java.time.DayOfWeek.MONDAY).atStartOfDay();
            }
            case "MONTH" -> {
                int months = (range <= 0 || range > 60) ? 12 : range;
                startDate = today.minusMonths(months - 1).withDayOfMonth(1).atStartOfDay();
            }
            case "YEAR" -> {
                int years = (range <= 0 || range > 10) ? 3 : range;
                startDate = today.minusYears(years - 1).withDayOfYear(1).atStartOfDay();
            }
            default -> { // "DAY"
                int days = (range <= 0 || range > 365) ? 7 : range;
                startDate = today.minusDays(days - 1).atStartOfDay();
            }
        }

        List<Order> orders = orderRepository.findByShopIdAndCreatedAtAfter(shop.getId(), startDate);

        // Tính tổng doanh thu thực tế từ các đơn COMPLETED
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Doanh thu tạm tính từ các đơn CONFIRMED / SHIPPING
        BigDecimal pendingRevenue = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CONFIRMED || o.getStatus() == OrderStatus.SHIPPING)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long completedOrdersCount = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();

        long totalOrdersAll = orders.size();

        BigDecimal aov = completedOrdersCount > 0
                ? totalRevenue.divide(BigDecimal.valueOf(completedOrdersCount), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Thống kê theo trạng thái
        Map<OrderStatus, Long> statusBreakdown = new EnumMap<>(OrderStatus.class);
        for (OrderStatus st : OrderStatus.values()) {
            statusBreakdown.put(st, 0L);
        }
        for (Order o : orders) {
            statusBreakdown.put(o.getStatus(), statusBreakdown.get(o.getStatus()) + 1);
        }

        // Tạo mảng timeline liên tục tùy theo period
        List<SellerAnalyticsResponse.DailyTimeline> timeline = new ArrayList<>();

        if ("WEEK".equals(period)) {
            LocalDate currWeekStart = startDate.toLocalDate().with(java.time.DayOfWeek.MONDAY);
            LocalDate endWeekStart = today.with(java.time.DayOfWeek.MONDAY);

            while (!currWeekStart.isAfter(endWeekStart)) {
                LocalDate currWeekEnd = currWeekStart.plusDays(6);
                LocalDateTime wStart = currWeekStart.atStartOfDay();
                LocalDateTime wEnd = currWeekEnd.atTime(23, 59, 59);

                List<Order> weekOrders = orders.stream()
                        .filter(o -> !o.getCreatedAt().isBefore(wStart) && !o.getCreatedAt().isAfter(wEnd))
                        .toList();

                BigDecimal weekRev = weekOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .map(Order::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                long weekCompleted = weekOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .count();

                String label = "Tuần " + currWeekStart.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR) 
                        + " (" + currWeekStart.format(DateTimeFormatter.ofPattern("dd/MM")) + ")";

                timeline.add(SellerAnalyticsResponse.DailyTimeline.builder()
                        .date(currWeekStart.toString())
                        .label(label)
                        .revenue(weekRev)
                        .orderCount(weekCompleted)
                        .totalCount((long) weekOrders.size())
                        .build());

                currWeekStart = currWeekStart.plusWeeks(1);
            }
        } else if ("MONTH".equals(period)) {
            YearMonth currMonth = YearMonth.from(startDate);
            YearMonth endMonth = YearMonth.from(today);

            while (!currMonth.isAfter(endMonth)) {
                int y = currMonth.getYear();
                int m = currMonth.getMonthValue();

                List<Order> monthOrders = orders.stream()
                        .filter(o -> o.getCreatedAt().getYear() == y && o.getCreatedAt().getMonthValue() == m)
                        .toList();

                BigDecimal monthRev = monthOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .map(Order::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                long monthCompleted = monthOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .count();

                timeline.add(SellerAnalyticsResponse.DailyTimeline.builder()
                        .date(currMonth.toString())
                        .label("Tháng " + m + "/" + y)
                        .revenue(monthRev)
                        .orderCount(monthCompleted)
                        .totalCount((long) monthOrders.size())
                        .build());

                currMonth = currMonth.plusMonths(1);
            }
        } else if ("YEAR".equals(period)) {
            int startYear = startDate.getYear();
            int endYear = today.getYear();

            for (int y = startYear; y <= endYear; y++) {
                final int currentYear = y;
                List<Order> yearOrders = orders.stream()
                        .filter(o -> o.getCreatedAt().getYear() == currentYear)
                        .toList();

                BigDecimal yearRev = yearOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .map(Order::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                long yearCompleted = yearOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .count();

                timeline.add(SellerAnalyticsResponse.DailyTimeline.builder()
                        .date(String.valueOf(y))
                        .label("Năm " + y)
                        .revenue(yearRev)
                        .orderCount(yearCompleted)
                        .totalCount((long) yearOrders.size())
                        .build());
            }
        } else { // "DAY"
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("dd/MM");
            LocalDate curr = startDate.toLocalDate();

            Map<String, List<Order>> ordersByDate = orders.stream()
                    .collect(Collectors.groupingBy(o -> o.getCreatedAt().toLocalDate().format(dateFormatter)));

            while (!curr.isAfter(today)) {
                String dateKey = curr.format(dateFormatter);
                String labelKey = curr.format(labelFormatter);
                List<Order> dayOrders = ordersByDate.getOrDefault(dateKey, List.of());

                BigDecimal dayRev = dayOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .map(Order::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                long dayCompletedCount = dayOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .count();

                timeline.add(SellerAnalyticsResponse.DailyTimeline.builder()
                        .date(dateKey)
                        .label(labelKey)
                        .revenue(dayRev)
                        .orderCount(dayCompletedCount)
                        .totalCount((long) dayOrders.size())
                        .build());

                curr = curr.plusDays(1);
            }
        }

        return SellerAnalyticsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(completedOrdersCount)
                .pendingRevenue(pendingRevenue)
                .totalOrdersAll(totalOrdersAll)
                .averageOrderValue(aov)
                .statusBreakdown(statusBreakdown)
                .timeline(timeline)
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }
}
