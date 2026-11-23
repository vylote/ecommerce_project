package com.vlt.ecommerce.service;

import java.util.List;

import com.vlt.ecommerce.service.dto.request.SpecificProductRequest;
import com.vlt.ecommerce.service.dto.response.SpecificProductResponse;

public interface SpecificProductService {

    List<SpecificProductResponse> getVariantsByProductId(Long productId, boolean onlyActive);

    SpecificProductResponse getVariantById(Long variantId);

    SpecificProductResponse createVariant(Long productId, SpecificProductRequest request);

    SpecificProductResponse updateVariant(Long variantId, SpecificProductRequest request);

    void deleteVariant(Long variantId);
}
