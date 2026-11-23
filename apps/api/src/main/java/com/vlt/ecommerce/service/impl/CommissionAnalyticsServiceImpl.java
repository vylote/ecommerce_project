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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.domain.CommissionRecord;
import com.vlt.ecommerce.repository.CommissionRecordRepository;
import com.vlt.ecommerce.service.CommissionAnalyticsService;
import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.service.dto.response.AdminAnalyticsResponse;
import com.vlt.ecommerce.service.dto.response.AdminStatsResponse;
import com.vlt.ecommerce.service.dto.response.SellerStatsResponse;
import com.vlt.ecommerce.domain.Order;
import com.vlt.ecommerce.domain.enumeration.OrderStatus;
import com.vlt.ecommerce.repository.OrderRepository;
import com.vlt.ecommerce.repository.ProductRepository;
import com.vlt.ecommerce.domain.Shop;
import com.vlt.ecommerce.repository.ShopRepository;
import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CommissionAnalyticsServiceImpl implements CommissionAnalyticsService {
    UserRepository userRepository;
    ShopRepository shopRepository;
    CommissionRecordRepository commissionRecordRepository;
    OrderRepository orderRepository;
    ProductRepository productRepository;

    @Override
    @PreAuthorize("hasRole('SELLER')")
    @Transactional(readOnly = true)
    public SellerStatsResponse getSellerStats() {
        User seller = getCurrentUser();

        Shop shop = shopRepository.findBySellerId(seller.getId());
        if (shop == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        Long sellerId = seller.getId();
        BigDecimal totalGrossRevenue = commissionRecordRepository.sumGrossRevenueBySellerId(sellerId);
        BigDecimal totalCommissionPaid = commissionRecordRepository.sumCommissionPaidBySellerId(sellerId);
        BigDecimal totalNetRevenue = commissionRecordRepository.sumNetRevenueBySellerId(sellerId);

        totalGrossRevenue = totalGrossRevenue != null ? totalGrossRevenue : BigDecimal.ZERO;
        totalCommissionPaid = totalCommissionPaid != null ? totalCommissionPaid : BigDecimal.ZERO;
        totalNetRevenue = totalNetRevenue != null ? totalNetRevenue : BigDecimal.ZERO;

        return SellerStatsResponse.builder()
            .totalGrossRevenue(totalGrossRevenue)
            .totalCommissionPaid(totalCommissionPaid)
            .totalNetRevenue(totalNetRevenue)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public AdminStatsResponse getAdminStats() {
        BigDecimal gross = commissionRecordRepository.sumTotalGrossRevenue();
        BigDecimal commission = commissionRecordRepository.sumTotalCommissionRevenue();

        return AdminStatsResponse.builder()
            .totalGrossRevenue(gross)
            .totalCommissionRevenue(commission)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public AdminAnalyticsResponse getAdminAnalytics(String periodType, int range) {
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

        List<Order> orders = orderRepository.findByCreatedAtAfter(startDate);
        List<CommissionRecord> commissionRecords = commissionRecordRepository.findByRecordedAtAfter(startDate);

        // GMV toàn sàn từ các đơn COMPLETED
        BigDecimal totalGrossRevenue = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tổng hoa hồng sàn thu được
        BigDecimal totalCommissionRevenue = commissionRecords.stream()
                .map(CommissionRecord::getCommissionAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Nếu commissionRecords chưa có nhưng có đơn COMPLETED, tính tổng hoa hồng theo cấu hình hoặc tỷ lệ thực tế
        if (totalCommissionRevenue.compareTo(BigDecimal.ZERO) == 0 && totalGrossRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal recordedGross = commissionRecordRepository.sumTotalCommissionRevenue();
            if (recordedGross != null && recordedGross.compareTo(BigDecimal.ZERO) > 0) {
                totalCommissionRevenue = recordedGross;
            }
        }

        BigDecimal totalNetRevenue = totalGrossRevenue.subtract(totalCommissionRevenue);
        if (totalNetRevenue.compareTo(BigDecimal.ZERO) < 0) totalNetRevenue = BigDecimal.ZERO;

        BigDecimal pendingGrossRevenue = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CONFIRMED || o.getStatus() == OrderStatus.SHIPPING)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long completedOrdersCount = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();

        long totalOrdersAll = orders.size();

        BigDecimal aov = completedOrdersCount > 0
                ? totalGrossRevenue.divide(BigDecimal.valueOf(completedOrdersCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long totalUsers = userRepository.count();
        long totalShops = shopRepository.count();
        long totalProducts = productRepository.count();

        // Thống kê phân bổ theo trạng thái đơn
        Map<OrderStatus, Long> statusBreakdown = new EnumMap<>(OrderStatus.class);
        for (OrderStatus st : OrderStatus.values()) {
            statusBreakdown.put(st, 0L);
        }
        for (Order o : orders) {
            statusBreakdown.put(o.getStatus(), statusBreakdown.get(o.getStatus()) + 1);
        }

        // Timeline theo period
        List<AdminAnalyticsResponse.AdminTimeline> timeline = new ArrayList<>();

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

                BigDecimal weekGross = weekOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .map(Order::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal weekComm = commissionRecords.stream()
                        .filter(r -> !r.getRecordedAt().isBefore(wStart) && !r.getRecordedAt().isAfter(wEnd))
                        .map(CommissionRecord::getCommissionAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                long weekCompleted = weekOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .count();

                String label = "Tuần " + currWeekStart.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR)
                        + " (" + currWeekStart.format(DateTimeFormatter.ofPattern("dd/MM")) + ")";

                timeline.add(AdminAnalyticsResponse.AdminTimeline.builder()
                        .date(currWeekStart.toString())
                        .label(label)
                        .grossRevenue(weekGross)
                        .commissionRevenue(weekComm)
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

                BigDecimal monthGross = monthOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .map(Order::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal monthComm = commissionRecords.stream()
                        .filter(r -> r.getRecordedAt().getYear() == y && r.getRecordedAt().getMonthValue() == m)
                        .map(CommissionRecord::getCommissionAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                long monthCompleted = monthOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .count();

                timeline.add(AdminAnalyticsResponse.AdminTimeline.builder()
                        .date(currMonth.toString())
                        .label("Tháng " + m + "/" + y)
                        .grossRevenue(monthGross)
                        .commissionRevenue(monthComm)
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

                BigDecimal yearGross = yearOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .map(Order::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal yearComm = commissionRecords.stream()
                        .filter(r -> r.getRecordedAt().getYear() == currentYear)
                        .map(CommissionRecord::getCommissionAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                long yearCompleted = yearOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .count();

                timeline.add(AdminAnalyticsResponse.AdminTimeline.builder()
                        .date(String.valueOf(y))
                        .label("Năm " + y)
                        .grossRevenue(yearGross)
                        .commissionRevenue(yearComm)
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

            Map<String, List<CommissionRecord>> recordsByDate = commissionRecords.stream()
                    .collect(Collectors.groupingBy(r -> r.getRecordedAt().toLocalDate().format(dateFormatter)));

            while (!curr.isAfter(today)) {
                String dateKey = curr.format(dateFormatter);
                String labelKey = curr.format(labelFormatter);
                List<Order> dayOrders = ordersByDate.getOrDefault(dateKey, List.of());
                List<CommissionRecord> dayRecords = recordsByDate.getOrDefault(dateKey, List.of());

                BigDecimal dayGross = dayOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .map(Order::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal dayComm = dayRecords.stream()
                        .map(CommissionRecord::getCommissionAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                long dayCompletedCount = dayOrders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                        .count();

                timeline.add(AdminAnalyticsResponse.AdminTimeline.builder()
                        .date(dateKey)
                        .label(labelKey)
                        .grossRevenue(dayGross)
                        .commissionRevenue(dayComm)
                        .orderCount(dayCompletedCount)
                        .totalCount((long) dayOrders.size())
                        .build());

                curr = curr.plusDays(1);
            }
        }

        return AdminAnalyticsResponse.builder()
                .totalGrossRevenue(totalGrossRevenue)
                .totalCommissionRevenue(totalCommissionRevenue)
                .totalNetRevenue(totalNetRevenue)
                .pendingGrossRevenue(pendingGrossRevenue)
                .averageOrderValue(aov)
                .totalOrders(completedOrdersCount)
                .totalOrdersAll(totalOrdersAll)
                .totalUsers(totalUsers)
                .totalShops(totalShops)
                .totalProducts(totalProducts)
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
