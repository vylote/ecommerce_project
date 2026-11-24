package com.vlt.ecommerce.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.vlt.ecommerce.domain.Order;
import com.vlt.ecommerce.domain.enumeration.OrderStatus;
import com.vlt.ecommerce.service.OrderAnalyticsService;
import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.repository.projection.OrderStatusStat;
import com.vlt.ecommerce.service.dto.response.SellerAnalyticsResponse;
import com.vlt.ecommerce.repository.OrderRepository;
import com.vlt.ecommerce.domain.Shop;
import com.vlt.ecommerce.repository.ShopRepository;
import com.vlt.ecommerce.domain.User;

import com.vlt.ecommerce.security.CurrentUserProvider;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class OrderAnalyticsServiceImpl implements OrderAnalyticsService {
    CurrentUserProvider currentUserProvider;
    OrderRepository orderRepository;
    ShopRepository shopRepository;

    @Override
    @PreAuthorize("hasRole('SELLER')")
    public Map<OrderStatus, Long> getDashboardStats() {
        User seller = currentUserProvider.getUser();
        Shop shop = shopRepository.findBySellerId(seller.getId());
        if (shop == null) throw new AppException(ErrorCode.SHOP_NOT_FOUND);

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

    @Override
    @PreAuthorize("hasRole('SELLER')")
    public SellerAnalyticsResponse getSellerAnalytics(String periodType, int range) {
        User seller = currentUserProvider.getUser();
        Shop shop = shopRepository.findBySellerId(seller.getId());
        if (shop == null) throw new AppException(ErrorCode.SHOP_NOT_FOUND);

        String period = (periodType == null || periodType.isBlank()) ? Constants.ANALYTICS_PERIOD_DAY : periodType.toUpperCase();
        LocalDate today = LocalDate.now();
        LocalDateTime startDate;

        switch (period) {
            case Constants.ANALYTICS_PERIOD_WEEK -> {
                int weeks = (range <= 0 || range > 52) ? 8 : range;
                startDate = today.minusWeeks(weeks - 1).with(DayOfWeek.MONDAY).atStartOfDay();
            }
            case Constants.ANALYTICS_PERIOD_MONTH -> {
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
                ? totalRevenue.divide(BigDecimal.valueOf(completedOrdersCount), 2, RoundingMode.HALF_UP)
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

        if (Constants.ANALYTICS_PERIOD_WEEK.equals(period)) {
            LocalDate currWeekStart = startDate.toLocalDate().with(DayOfWeek.MONDAY);
            LocalDate endWeekStart = today.with(DayOfWeek.MONDAY);

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

                String label = "Tuần " + currWeekStart.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR)
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
        } else if (Constants.ANALYTICS_PERIOD_MONTH.equals(period)) {
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
}
