package com.vlt.ecommerce.service.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;

import com.vlt.ecommerce.domain.Category;
import com.vlt.ecommerce.domain.ProductSpecification;
import com.vlt.ecommerce.domain.Specification;
import com.vlt.ecommerce.domain.SpecificationType;
import com.vlt.ecommerce.service.dto.response.ProductSpecificationResponse;
import com.vlt.ecommerce.service.dto.response.SpecificationResponse;
import com.vlt.ecommerce.service.dto.response.SpecificationTypeResponse;

@Mapper(componentModel = "spring")
public interface SpecificationMapper {
    default SpecificationTypeResponse toSpecificationTypeResponse(SpecificationType type) {
        List<SpecificationResponse> specs = type.getSpecifications() != null
                ? type.getSpecifications().stream().map(this::toSpecificationResponse).collect(Collectors.toList())
                : List.of();

        List<Long> catIds = type.getCategories() != null
                ? type.getCategories().stream().map(Category::getId).collect(Collectors.toList())
                : List.of();

        List<String> catNames = type.getCategories() != null
                ? type.getCategories().stream().map(Category::getName).collect(Collectors.toList())
                : List.of();

        return SpecificationTypeResponse.builder()
                .id(type.getId())
                .name(type.getName())
                .description(type.getDescription())
                .isVariant(Boolean.TRUE.equals(type.getIsVariant()))
                .createdAt(type.getCreatedAt())
                .specifications(specs)
                .categoryIds(catIds)
                .categoryNames(catNames)
                .build();
    }

    default SpecificationResponse toSpecificationResponse(Specification spec) {
        return SpecificationResponse.builder()
                .id(spec.getId())
                .name(spec.getName())
                .description(spec.getDescription())
                .specificationTypeId(spec.getSpecificationType() != null ? spec.getSpecificationType().getId() : null)
                .specificationTypeName(spec.getSpecificationType() != null ? spec.getSpecificationType().getName() : null)
                .build();
    }

    default ProductSpecificationResponse toProductSpecificationResponse(ProductSpecification ps) {
        return ProductSpecificationResponse.builder()
                .id(ps.getId())
                .productId(ps.getProduct().getId())
                .specificationId(ps.getSpecification().getId())
                .specificationName(ps.getSpecification().getName())
                .specificationTypeId(ps.getSpecification().getSpecificationType() != null ? ps.getSpecification().getSpecificationType().getId() : null)
                .specificationTypeName(ps.getSpecification().getSpecificationType() != null ? ps.getSpecification().getSpecificationType().getName() : null)
                .customValue(ps.getCustomValue())
                .build();
    }
}
