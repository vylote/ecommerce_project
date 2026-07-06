package com.vlt.ecommerce.feature.shop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShopResponse {
    Long id;
    String name;
    String description;
    String logoUrl;
    String address;
    Long sellerId;
    Double rating;
}
