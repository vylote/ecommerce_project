package com.vlt.ecommerce.feature.review;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse {
    int rating;
    String comment;
    Long productId;
    Long buyerId;
    Long orderId;
    String buyerName;
    String buyerAvatarUrl;
}
