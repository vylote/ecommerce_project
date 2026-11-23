package com.vlt.ecommerce.service.dto.request;

import com.vlt.ecommerce.config.Constants;

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
    @NotNull(message = "{validation.review.productId.required}")
    Long productId;

    @NotNull(message = "{validation.review.orderId.required}")
    Long orderId;

    @NotNull(message = "{validation.review.rating.required}")
    @Min(value = Constants.MIN_REVIEW_STARS, message = "{validation.review.rating.min}")
    @Max(value = Constants.MAX_REVIEW_STARS, message = "{validation.review.rating.max}")
    Integer rating;

    @NotBlank(message = "{validation.review.comment.required}")
    String comment;
}
