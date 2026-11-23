package com.vlt.ecommerce.feature.product.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductSpecificationRequest {
    @NotNull(message = "ID đặc tả (specificationId) không được để trống")
    Long specificationId;

    @Size(max = 255, message = "Giá trị tùy biến tối đa 255 ký tự")
    String customValue;
}
