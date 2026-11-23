package com.vlt.ecommerce.service;

import java.util.List;

import com.vlt.ecommerce.service.dto.request.CommissionConfigRequest;
import com.vlt.ecommerce.service.dto.response.CommissionConfigResponse;

public interface CommissionService {

    CommissionConfigResponse createOrUpdateConfig(CommissionConfigRequest request);

    List<CommissionConfigResponse> getConfigs();
}
