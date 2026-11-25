package com.vlt.ecommerce.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.vlt.ecommerce.config.Constants;
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
            config = newConfig(request, category, user);
        }

        return commissionConfigMapper.toCommissionConfigResponse(commissionConfigRepository.save(config));
    }

    @Override
    public void createInitialConfig(Category category, BigDecimal rate) {
        CommissionConfigRequest request = new CommissionConfigRequest();
        request.setRate(rate != null ? rate : Constants.DEFAULT_CATEGORY_COMMISSION_RATE);
        request.setEffectiveFrom(LocalDate.now());
        commissionConfigRepository.save(newConfig(request, category, currentUserProvider.getUser()));
    }

    @Override
    public boolean hasEffectiveConfig(Long categoryId) {
        return commissionConfigRepository.existsByCategoryIdAndEffectiveFromLessThanEqual(categoryId, LocalDate.now());
    }

    private CommissionConfig newConfig(CommissionConfigRequest request, Category category, User creator) {
        CommissionConfig config = commissionConfigMapper.toCommissionConfig(request);
        config.setCategory(category);
        config.setCreatedBy(creator);
        return config;
    }

    @Override
    public List<CommissionConfigResponse> getConfigs() {
        User user = currentUserProvider.getUser();

        List<CommissionConfig> configs = commissionConfigRepository.findByCreatedById(user.getId());

        return commissionConfigMapper.toCommissionConfigResponses(configs);
    }
}
