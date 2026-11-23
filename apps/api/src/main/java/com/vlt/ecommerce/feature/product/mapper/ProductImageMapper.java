package com.vlt.ecommerce.feature.product.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vlt.ecommerce.feature.product.ProductImage;
import com.vlt.ecommerce.feature.product.dto.request.ProductImageRequest;
import com.vlt.ecommerce.feature.product.dto.response.ProductImageResponse;

@Mapper(componentModel = "spring")
public interface ProductImageMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "isPrimary", source = "isPrimary", defaultValue = "false")
    @Mapping(target = "sortOrder", source = "sortOrder", defaultValue = "0")
    ProductImage toProductImage(ProductImageRequest request);

    @Mapping(target = "productId", source = "product.id")
    ProductImageResponse toProductImageResponse(ProductImage productImage);
}
