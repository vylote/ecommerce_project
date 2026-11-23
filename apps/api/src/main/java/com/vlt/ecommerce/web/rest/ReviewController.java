package com.vlt.ecommerce.web.rest;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.service.ReviewService;
import com.vlt.ecommerce.service.dto.request.CreateReviewRequest;
import com.vlt.ecommerce.service.dto.response.ReviewResponse;
import com.vlt.ecommerce.service.dto.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/reviews")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class ReviewController {
    ReviewService reviewService;

    @PostMapping
    public ApiResponse<ReviewResponse> createReview(@RequestBody @Valid CreateReviewRequest request) {
        return ApiResponse.<ReviewResponse>builder()
            .result(reviewService.createReview(request))
            .build();
    }
}
