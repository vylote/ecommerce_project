package com.vlt.ecommerce.service.dto.request;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShopRequest {
    @NotBlank(message = "{validation.shop.name.required}")
    String name;
    String description;
    String logoUrl;
    @NotBlank(message = "{validation.shop.pickupAddress.required}")
    String address;
    Set<Long> categoryIds;
}
