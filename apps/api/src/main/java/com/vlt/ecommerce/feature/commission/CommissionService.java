package com.vlt.ecommerce.feature.commission;

import java.util.List;

import com.vlt.ecommerce.feature.commission.dto.request.CommissionConfigRequest;
import com.vlt.ecommerce.feature.commission.dto.response.CommissionConfigResponse;

public interface CommissionService {

    CommissionConfigResponse createOrUpdateConfig(CommissionConfigRequest request);

    List<CommissionConfigResponse> getConfigs();
}
