package com.vlt.ecommerce.feature.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateReviewRequest {
    @NotNull(message = "Product ID không được để trống")
    Long productId;

    @NotNull(message = "Order ID không được để trống")
    Long orderId;

    @Min(value = 1, message = "Đánh giá tối thiểu là 1 sao")
    @Max(value = 5, message = "Đánh giá tối đa là 5 sao")
    int rating;

    @NotBlank(message = "Nội dung bình luận không được để trống")
    String comment;
}
