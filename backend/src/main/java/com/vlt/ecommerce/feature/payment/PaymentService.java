package com.vlt.ecommerce.feature.payment;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.event.PaymentSuccessEvent;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.order.Order;
import com.vlt.ecommerce.feature.order.OrderRepository;
import com.vlt.ecommerce.feature.payment.dto.PaymentRequest;
import com.vlt.ecommerce.feature.payment.dto.PaymentResponse;
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
public class PaymentService {
    PaymentRepository paymentRepository;
    PaymentMapper paymentMapper;
    OrderRepository orderRepository;
    UserRepository userRepository;
    ApplicationEventPublisher eventPublisher; // Thêm cái này

    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public PaymentResponse create(Long orderId, PaymentRequest request) {
        User buyer = getCurrentUser();
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (paymentRepository.findByOrderId(orderId).isPresent()) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        Payment payment = paymentMapper.toPayment(request);
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setMethod(request.getMethod());
        return paymentMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public PaymentResponse confirmMockPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        if (payment.getStatus() == Payment.PaymentStatus.PAID) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_PROCESSED);
        }
        
        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        payment.setTransactionRef("MOCK_TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        eventPublisher.publishEvent(new PaymentSuccessEvent(payment.getOrder().getId()));
        
        return paymentMapper.toPaymentResponse(payment);
    }

    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        User currentUser = getCurrentUser();
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        boolean isBuyer = payment.getOrder().getBuyer().getId().equals(currentUser.getId());
        boolean isSeller = payment.getOrder().getShop().getSeller().getId().equals(currentUser.getId());

        if (!isBuyer && !isSeller) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return paymentMapper.toPaymentResponse(payment);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }
}
