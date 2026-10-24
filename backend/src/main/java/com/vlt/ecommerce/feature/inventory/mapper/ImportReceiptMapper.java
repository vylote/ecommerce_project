package com.vlt.ecommerce.feature.inventory.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vlt.ecommerce.feature.inventory.ImportReceipt;
import com.vlt.ecommerce.feature.inventory.ImportReceiptDetail;
import com.vlt.ecommerce.feature.inventory.dto.response.ImportReceiptDetailResponse;
import com.vlt.ecommerce.feature.inventory.dto.response.ImportReceiptResponse;

@Mapper(componentModel = "spring")
public interface ImportReceiptMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "shopName", source = "shop.name")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    ImportReceiptResponse toResponse(ImportReceipt receipt);

    List<ImportReceiptResponse> toResponses(List<ImportReceipt> receipts);

    @Mapping(target = "specificProductId", source = "specificProduct.id")
    @Mapping(target = "variantName", source = "specificProduct.name")
    @Mapping(target = "sku", source = "specificProduct.sku")
    ImportReceiptDetailResponse toDetailResponse(ImportReceiptDetail detail);

    List<ImportReceiptDetailResponse> toDetailResponses(List<ImportReceiptDetail> details);
}
