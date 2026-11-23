package com.vlt.ecommerce.service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vlt.ecommerce.domain.ProductImage;
import com.vlt.ecommerce.service.dto.request.ProductImageRequest;
import com.vlt.ecommerce.service.dto.response.ProductImageResponse;

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
