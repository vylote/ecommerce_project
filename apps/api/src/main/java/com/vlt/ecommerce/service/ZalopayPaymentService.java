package com.vlt.ecommerce.service;

import com.vlt.ecommerce.service.dto.request.ZalopayCallbackRequest;
import com.vlt.ecommerce.service.dto.response.ZalopayPaymentResponse;

public interface ZalopayPaymentService {
    ZalopayPaymentResponse start(Long orderId);
    boolean acceptCallback(ZalopayCallbackRequest request);
    void reconcilePending(Long orderId);
}
