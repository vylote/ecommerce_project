package com.vlt.ecommerce.service.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.domain.Payment;
import com.vlt.ecommerce.repository.PaymentRepository;
import com.vlt.ecommerce.service.PaymentService;
import com.vlt.ecommerce.service.mapper.PaymentMapper;
import com.vlt.ecommerce.domain.event.PaymentSuccessEvent;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.domain.Order;
import com.vlt.ecommerce.repository.OrderRepository;
import com.vlt.ecommerce.service.dto.request.PaymentRequest;
import com.vlt.ecommerce.service.dto.response.PaymentResponse;
import com.vlt.ecommerce.domain.User;

import com.vlt.ecommerce.security.CurrentUserProvider;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    CurrentUserProvider currentUserProvider;
    PaymentRepository paymentRepository;
    PaymentMapper paymentMapper;
    OrderRepository orderRepository;
    ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public PaymentResponse create(Long orderId, PaymentRequest request) {
        User buyer = currentUserProvider.getUser();
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (paymentRepository.findByOrderId(orderId).isPresent()) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_EXISTS);
        }

        Payment payment = paymentMapper.toPayment(request);
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setMethod(request.getMethod());
        return paymentMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public PaymentResponse confirmMockPayment(Long paymentId) {
        User buyer = currentUserProvider.getUser();

        Payment payment = paymentRepository.findByIdForUpdate(paymentId)
            .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getOrder() == null || payment.getOrder().getBuyer() == null
                || !payment.getOrder().getBuyer().getId().equals(buyer.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (payment.getStatus() == Payment.PaymentStatus.PAID) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_PROCESSED);
        }

        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        payment.setTransactionRef("MOCK_TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        eventPublisher.publishEvent(new PaymentSuccessEvent(payment.getOrder().getId()));

        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        User currentUser = currentUserProvider.getUser();
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        boolean isBuyer = payment.getOrder().getBuyer().getId().equals(currentUser.getId());
        boolean isSeller = payment.getOrder().getShop().getSeller().getId().equals(currentUser.getId());

        if (!isBuyer && !isSeller) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return paymentMapper.toPaymentResponse(payment);
    }
}
