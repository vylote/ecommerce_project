package com.vlt.ecommerce.feature.product.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
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
public class SpecificProductRequest {
    @NotBlank(message = "Tên biến thể sản phẩm không được để trống")
    @Size(max = 255, message = "Tên biến thể tối đa 255 ký tự")
    String name;

    @Size(max = 100, message = "Mã SKU tối đa 100 ký tự")
    String sku;

    @NotNull(message = "Giá bán không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá bán phải lớn hơn hoặc bằng 0")
    BigDecimal price;

    @Size(max = 500, message = "Đường dẫn ảnh tối đa 500 ký tự")
    String imageUrl;

    @Builder.Default
    Boolean isActive = true;
}
