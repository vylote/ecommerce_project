package com.vlt.ecommerce.feature.commission;

import java.util.List;
import java.util.Optional;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.commission.dto.request.CommissionConfigRequest;
import com.vlt.ecommerce.feature.commission.dto.response.CommissionConfigResponse;
import com.vlt.ecommerce.feature.product.Category;
import com.vlt.ecommerce.feature.product.repository.CategoryRepository;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CommissionServiceImpl implements CommissionService {
    UserRepository userRepository;
    CategoryRepository categoryRepository;
    CommissionConfigRepository commissionConfigRepository;
    CommissionConfigMapper commissionConfigMapper;

    @Override
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

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public List<CommissionConfigResponse> getConfigs() {
        User user = getCurrentUser();

        List<CommissionConfig> configs = commissionConfigRepository.findByCreatedById(user.getId());

        return commissionConfigMapper.toCommissionConfigResponses(configs);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }
}
