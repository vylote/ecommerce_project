package com.vlt.ecommerce.feature.commission;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.order.Order;
import com.vlt.ecommerce.feature.order.OrderItem;
import com.vlt.ecommerce.feature.order.OrderStatus;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CommissionCalculatorImpl implements CommissionCalculator {
    CommissionConfigRepository commissionConfigRepository;
    CommissionRecordRepository commissionRecordRepository;

    @Override
    @Transactional
    public void calculateCommission(Order order) {
        if (!OrderStatus.COMPLETED.name().equals(order.getStatus().name())) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        LocalDate today = LocalDate.now();

        for (OrderItem item : order.getItems()) {
            if (commissionRecordRepository.existsByOrderItemId(item.getId())) {
                log.warn("Món hàng OrderItem #{} của đơn #{} đã được tính hoa hồng trước đó, bỏ qua.", item.getId(), order.getId());
                continue;
            }

            Long categoryId = item.getProduct().getCategory().getId();

            CommissionConfig config = commissionConfigRepository
                    .findActiveConfigByCategory(categoryId, today)
                    .orElseThrow(() -> new AppException(ErrorCode.COMMISSION_NOT_CONFIGURED));

            BigDecimal commissionRate = config.getRate();
            BigDecimal itemRevenue = item.getTotalPrice();

            //Hoa hong rate*itemrevenue
            BigDecimal commissionAmount = itemRevenue.multiply(commissionRate);

            //doanh thu seller
            BigDecimal netRevenue = itemRevenue.subtract(commissionAmount);

            CommissionRecord record = CommissionRecord.builder()
                    .order(order)
                    .orderItem(item)
                    .seller(item.getShop().getSeller())
                    .commissionRate(commissionRate)
                    .itemRevenue(itemRevenue)
                    .commissionAmount(commissionAmount)
                    .netRevenue(netRevenue)
                    .build();

            commissionRecordRepository.save(record);
        }
    }
}
