package com.vlt.ecommerce.service.impl;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.domain.Review;
import com.vlt.ecommerce.repository.ReviewRepository;
import com.vlt.ecommerce.service.ReviewService;
import com.vlt.ecommerce.service.dto.request.CreateReviewRequest;
import com.vlt.ecommerce.service.dto.response.ReviewResponse;
import com.vlt.ecommerce.service.mapper.ReviewMapper;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.domain.Order;
import com.vlt.ecommerce.domain.OrderItem;
import com.vlt.ecommerce.domain.enumeration.OrderStatus;
import com.vlt.ecommerce.repository.OrderRepository;
import com.vlt.ecommerce.domain.Product;
import com.vlt.ecommerce.service.ProductService;
import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    ReviewRepository reviewRepository;
    ReviewMapper reviewMapper;
    UserRepository userRepository;
    OrderRepository orderRepository;
    ProductService productService;

    @Override
    @PreAuthorize("hasRole('BUYER')")
    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (order.getShop().getSeller().getId().equals(buyer.getId())) {
            throw new AppException(ErrorCode.CANNOT_BUY_OWN_PRODUCT);
        }

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
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTED);
        }

        Review review = reviewMapper.toReview(request);
        review.setBuyer(buyer);
        review.setOrder(order);

        // Lấy managed Product từ OrderItems
        Product product = order.getItems().stream()
            .map(OrderItem::getProduct)
            .filter(p -> p.getId().equals(request.getProductId()))
            .findFirst()
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        review.setProduct(product);

        Review savedReview = reviewRepository.save(review);
        productService.updateProductRatingStats(savedReview.getProduct().getId());
        return reviewMapper.toReviewResponse(savedReview);
    }
}
