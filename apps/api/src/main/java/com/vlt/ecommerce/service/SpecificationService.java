package com.vlt.ecommerce.service;

import java.util.List;

import com.vlt.ecommerce.service.dto.request.ProductSpecificationRequest;
import com.vlt.ecommerce.service.dto.request.SpecificationRequest;
import com.vlt.ecommerce.service.dto.request.SpecificationTypeRequest;
import com.vlt.ecommerce.service.dto.response.ProductSpecificationResponse;
import com.vlt.ecommerce.service.dto.response.SpecificationResponse;
import com.vlt.ecommerce.service.dto.response.SpecificationTypeResponse;

public interface SpecificationService {

    List<SpecificationTypeResponse> getAllSpecificationTypes();

    List<SpecificationTypeResponse> getSpecificationTypesByCategory(Long categoryId);

    SpecificationTypeResponse getSpecificationTypeById(Long id);

    SpecificationTypeResponse createSpecificationType(SpecificationTypeRequest request);

    SpecificationTypeResponse updateSpecificationType(Long id, SpecificationTypeRequest request);

    void deleteSpecificationType(Long id);

    List<SpecificationResponse> getSpecificationsByType(Long typeId);

    SpecificationResponse createSpecification(SpecificationRequest request);

    SpecificationResponse updateSpecification(Long id, SpecificationRequest request);

    void deleteSpecification(Long id);

    List<ProductSpecificationResponse> getProductSpecifications(Long productId);

    ProductSpecificationResponse addProductSpecification(Long productId, ProductSpecificationRequest request);

    void removeProductSpecification(Long productId, Long specificationId);
}
