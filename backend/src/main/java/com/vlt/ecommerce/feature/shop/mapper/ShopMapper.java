package com.vlt.ecommerce.feature.shop.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.vlt.ecommerce.feature.shop.Shop;
import com.vlt.ecommerce.feature.shop.dto.request.ShopRequest;
import com.vlt.ecommerce.feature.shop.dto.response.ShopResponse;

@Mapper(componentModel = "spring")
public interface ShopMapper {
    @Mapping(source = "seller.id", target = "sellerId")
    @Mapping(source = "shop.rating", target = "rating")
    ShopResponse toShopResponse(Shop shop);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true) 
    @Mapping(target = "products", ignore = true) 
    @Mapping(target = "rating", ignore = true) 
    Shop tShop(ShopRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true) 
    @Mapping(target = "products", ignore = true) 
    @Mapping(target = "rating", ignore = true) 
    void updateShopFromRequest(ShopRequest request, @MappingTarget Shop shop);

    List<ShopResponse> toShopResponses(List<Shop> shops);
}
