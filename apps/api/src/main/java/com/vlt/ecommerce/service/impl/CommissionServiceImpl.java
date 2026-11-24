package com.vlt.ecommerce.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.vlt.ecommerce.domain.CommissionConfig;
import com.vlt.ecommerce.repository.CommissionConfigRepository;
import com.vlt.ecommerce.service.CommissionService;
import com.vlt.ecommerce.service.mapper.CommissionConfigMapper;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.service.dto.request.CommissionConfigRequest;
import com.vlt.ecommerce.service.dto.response.CommissionConfigResponse;
import com.vlt.ecommerce.domain.Category;
import com.vlt.ecommerce.repository.CategoryRepository;
import com.vlt.ecommerce.domain.User;

import com.vlt.ecommerce.security.CurrentUserProvider;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CommissionServiceImpl implements CommissionService {
    CurrentUserProvider currentUserProvider;
    CategoryRepository categoryRepository;
    CommissionConfigRepository commissionConfigRepository;
    CommissionConfigMapper commissionConfigMapper;

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public CommissionConfigResponse createOrUpdateConfig(CommissionConfigRequest request) {
        User user = currentUserProvider.getUser();

        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

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
        User user = currentUserProvider.getUser();

        List<CommissionConfig> configs = commissionConfigRepository.findByCreatedById(user.getId());

        return commissionConfigMapper.toCommissionConfigResponses(configs);
    }
}
