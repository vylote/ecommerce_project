package com.vlt.ecommerce.service;

import com.vlt.ecommerce.service.dto.request.CreateReviewRequest;
import com.vlt.ecommerce.service.dto.response.ReviewResponse;

public interface ReviewService {

    ReviewResponse createReview(CreateReviewRequest request);
}
