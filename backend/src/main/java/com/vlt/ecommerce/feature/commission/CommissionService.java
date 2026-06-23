package com.vlt.ecommerce.feature.commission;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.commission.dto.request.CommissionConfigRequest;
import com.vlt.ecommerce.feature.commission.dto.response.AdminStatsResponse;
import com.vlt.ecommerce.feature.commission.dto.response.CommissionConfigResponse;
import com.vlt.ecommerce.feature.commission.dto.response.SellerStatsResponse;
import com.vlt.ecommerce.feature.order.Order;
import com.vlt.ecommerce.feature.order.OrderItem;
import com.vlt.ecommerce.feature.order.OrderStatus;
import com.vlt.ecommerce.feature.product.Category;
import com.vlt.ecommerce.feature.product.repository.CategoryRepository;
import com.vlt.ecommerce.feature.shop.Shop;
import com.vlt.ecommerce.feature.shop.repository.ShopRepository;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CommissionService {
    UserRepository userRepository;
    CategoryRepository categoryRepository;
    ShopRepository shopRepository;
    CommissionConfigRepository commissionConfigRepository;
    CommissionRecordRepository commissionRecordRepository;
    CommissionConfigMapper commissionConfigMapper;

    @PreAuthorize("hasRole('ADMIN')")
    public CommissionConfigResponse createOrUpdateConfig(CommissionConfigRequest request) {
        User user = getCurrentUser();

        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Optional<CommissionConfig> existingConfig = commissionConfigRepository.findByCategoryId(category.getId());

        CommissionConfig config;
        if (existingConfig.isPresent()) {
            config = existingConfig.get();
            commissionConfigMapper.updateCommissionConfig(request, config);
        } else {
            config = commissionConfigMapper.toCommissionConfig(request);
            config.setCreatedBy(user);
            config.setCategory(category);
        }

        return commissionConfigMapper.toCommissionConfigResponse(commissionConfigRepository.save(config));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<CommissionConfigResponse> getConfigs() {
        User user = getCurrentUser();

        List<CommissionConfig> configs = commissionConfigRepository.findByCreatedById(user.getId());

        return commissionConfigMapper.toCommissionConfigResponses(configs);
    }

    @Transactional
    public void calculateCommission(Order order) {
        if (!OrderStatus.COMPLETED.name().equals(order.getStatus().name())) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        LocalDate today = LocalDate.now();

        for (OrderItem item : order.getItems()) {
            Long categoryId = item.getProduct().getCategory().getId();
            // 3. LOGIC TÌM KIẾM TỶ LỆ PHÍ (Tư duy Fallback)
            // Ưu tiên tìm cấu hình riêng của Danh mục đang có hiệu lực
            CommissionConfig config = commissionConfigRepository
                    .findActiveConfigByCategory(categoryId, today)
                    .orElseGet(() -> 
                            // Nếu không có, Fallback về cấu hình Global (category_id = NULL)
                            commissionConfigRepository
                                .findActiveGlobalConfig(today)
                                .orElseThrow(() -> new AppException(ErrorCode.COMMISSION_NOT_CONFIGURED))
                    );

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

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }
}
