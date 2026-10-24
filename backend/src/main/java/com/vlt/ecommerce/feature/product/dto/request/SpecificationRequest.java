package com.vlt.ecommerce.feature.product.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class SpecificationRequest {
    @NotBlank(message = "Tên đặc tả không được để trống")
    @Size(max = 100, message = "Tên đặc tả tối đa 100 ký tự")
    String name;

    @Size(max = 255, message = "Mô tả tối đa 255 ký tự")
    String description;

    Long specificationTypeId;
}
