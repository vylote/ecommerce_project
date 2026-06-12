package com.vlt.ecommerce.feature.shop.dto.response;

import com.vlt.ecommerce.feature.user.User;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShopResponse {
    String name;
    String description;
    String logoUrl;
    String address;
    User seller;
}
