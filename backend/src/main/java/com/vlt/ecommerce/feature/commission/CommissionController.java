package com.vlt.ecommerce.feature.commission;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.feature.commission.dto.request.CommissionConfigRequest;
import com.vlt.ecommerce.feature.commission.dto.response.CommissionConfigResponse;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/commission")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class CommissionController {
    CommissionService commissionService;

    @PostMapping("/configs")
    public ApiResponse<CommissionConfigResponse> createOrUpdateConfig(@RequestBody @Valid CommissionConfigRequest request) {
        return ApiResponse.<CommissionConfigResponse>builder()
            .result(commissionService.createOrUpdateConfig(request))
            .build();
    }

    @GetMapping("/configs")
    public ApiResponse<List<CommissionConfigResponse>> getConfigs() {
        return ApiResponse.<List<CommissionConfigResponse>>builder()
            .result(commissionService.getConfigs())
            .build();
    }
}
