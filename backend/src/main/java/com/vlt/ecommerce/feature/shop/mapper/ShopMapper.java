package com.vlt.ecommerce.feature.shop.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vlt.ecommerce.feature.shop.Shop;
import com.vlt.ecommerce.feature.shop.dto.request.ShopRequest;
import com.vlt.ecommerce.feature.shop.dto.response.ShopResponse;

@Mapper(componentModel = "spring")
public interface ShopMapper {
    @Mapping(source = "seller.id", target = "sellerId")
    ShopResponse toShopResponse(Shop shop);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true) 
    Shop tShop(ShopRequest request);
}
