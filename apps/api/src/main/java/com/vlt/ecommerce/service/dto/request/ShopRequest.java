package com.vlt.ecommerce.service.dto.request;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShopRequest {
    @NotBlank(message = "Tên cửa hàng không được để trống")
    String name;
    String description;
    String logoUrl;
    @NotBlank(message = "Địa chỉ lấy hàng không được để trống")
    String address;
    Set<Long> categoryIds;
}
