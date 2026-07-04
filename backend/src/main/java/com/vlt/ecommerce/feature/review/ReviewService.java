package com.vlt.ecommerce.feature.review;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.order.Order;
import com.vlt.ecommerce.feature.order.OrderRepository;
import com.vlt.ecommerce.feature.order.OrderStatus;
import com.vlt.ecommerce.feature.product.service.ProductService;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ReviewService {
    ReviewRepository  reviewRepository;
    ReviewMapper reviewMapper;
    UserRepository userRepository;
    OrderRepository orderRepository;
    ProductService productService;

    @PreAuthorize("hasRole('BUYER')")
    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User buyer = userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Order order = orderRepository.findById(request.getOrderId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (!order.getStatus().equals(OrderStatus.COMPLETED)) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        boolean productInOrder = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(request.getProductId()));

        if (!productInOrder) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        boolean alreadyReviewed = reviewRepository.existsByBuyerIdAndOrderIdAndProductId(
                buyer.getId(), order.getId(), request.getProductId());
        
        if (alreadyReviewed) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED); 
        }

        Review review = reviewMapper.toReview(request);
        review.setBuyer(buyer);
        Review savedReview = reviewRepository.save(review);
        productService.updateProductRatingStats(savedReview.getProduct().getId());
        return reviewMapper.toReviewResponse(savedReview);
    }
}
