package com.vlt.ecommerce.service;

import java.math.BigDecimal;
import java.util.List;

import com.vlt.ecommerce.domain.Category;
import com.vlt.ecommerce.service.dto.request.CommissionConfigRequest;
import com.vlt.ecommerce.service.dto.response.CommissionConfigResponse;

public interface CommissionService {

    CommissionConfigResponse createOrUpdateConfig(CommissionConfigRequest request);

    void createInitialConfig(Category category, BigDecimal rate);

    boolean hasEffectiveConfig(Long categoryId);

    List<CommissionConfigResponse> getConfigs();
}
