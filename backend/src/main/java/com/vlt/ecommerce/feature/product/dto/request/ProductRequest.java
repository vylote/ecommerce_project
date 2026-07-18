package com.vlt.ecommerce.feature.product.dto.request;

import java.math.BigDecimal;

import com.vlt.ecommerce.feature.product.ProductStatus;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductRequest {
    @NotBlank
    String name;
    String description;
    @NotNull(message = "Giá không được để trống")
    @Min(value = 0, message = "Giá sản phẩm phải lớn hơn hoặc bằng 0")
    BigDecimal price;
    @NotNull(message = "Số lượng kho không được để trống")
    @Min(value = 0, message = "Số lượng không được âm")
    Integer stockQuantity;
    @NotNull(message = "Danh mục không được để trống")
    Long categoryId;
    ProductStatus status;
}
