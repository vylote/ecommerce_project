package com.vlt.ecommerce.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import com.vlt.ecommerce.config.properties.ZalopayProperties;
import com.vlt.ecommerce.domain.Order;
import com.vlt.ecommerce.domain.Payment;
import com.vlt.ecommerce.domain.Payment.PaymentMethod;
import com.vlt.ecommerce.domain.Payment.PaymentStatus;
import com.vlt.ecommerce.domain.enumeration.OrderStatus;
import com.vlt.ecommerce.domain.event.PaymentSuccessEvent;
import com.vlt.ecommerce.integration.zalopay.ZalopayClient;
import com.vlt.ecommerce.integration.zalopay.ZalopayClient.CallbackData;
import com.vlt.ecommerce.integration.zalopay.ZalopayClient.QueryResult;
import com.vlt.ecommerce.repository.OrderRepository;
import com.vlt.ecommerce.repository.PaymentRepository;
import com.vlt.ecommerce.security.CurrentUserProvider;
import com.vlt.ecommerce.service.ZalopayPaymentService;
import com.vlt.ecommerce.service.dto.request.ZalopayCallbackRequest;
import com.vlt.ecommerce.service.dto.response.ZalopayPaymentResponse;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ZalopayPaymentServiceImpl implements ZalopayPaymentService {
    private final CurrentUserProvider currentUser;
    private final ZalopayProperties properties;
    private final ZalopayClient client;
    private final OrderRepository orders;
    private final PaymentRepository payments;
    private final TransactionTemplate transactions;
    private final ApplicationEventPublisher events;

    @Override
    public ZalopayPaymentResponse start(Long orderId) {
        if (!properties.configured()) throw new AppException(ErrorCode.ZALOPAY_NOT_CONFIGURED);
        Long buyerId = currentUser.getUserId();
        Attempt attempt = Objects.requireNonNull(transactions.execute(status -> reserve(orderId, buyerId)));
        if (attempt.payUrl() != null) return new ZalopayPaymentResponse(attempt.payUrl());

        String url = client.createPayUrl(attempt.transactionId(), orderId, attempt.amount());
        transactions.executeWithoutResult(status -> {
            lockOrder(orderId);
            Payment payment = lockPayment(orderId);
            if (isPending(payment, attempt.transactionId())) payment.setGatewayPayUrl(url);
        });
        return new ZalopayPaymentResponse(url);
    }

    private Attempt reserve(Long orderId, Long buyerId) {
        Order order = lockOrder(orderId);
        if (!order.getBuyer().getId().equals(buyerId)) throw new AppException(ErrorCode.UNAUTHORIZED);
        if (order.getStatus() != OrderStatus.PENDING) throw new AppException(ErrorCode.INVALID_ORDER_STATUS);

        Payment payment = lockPayment(orderId);
        if (payment.getMethod() != PaymentMethod.ZALOPAY) throw new AppException(ErrorCode.PAYMENT_METHOD_MISMATCH);
        if (payment.getStatus() != PaymentStatus.PENDING) throw new AppException(ErrorCode.PAYMENT_ALREADY_PROCESSED);
        long amount;
        try {
            amount = payment.getAmount().longValueExact();
        } catch (ArithmeticException exception) {
            throw new AppException(ErrorCode.ZALOPAY_INVALID_AMOUNT);
        }
        if (amount <= 0 || payment.getAmount().compareTo(order.getTotalAmount()) != 0) {
            throw new AppException(ErrorCode.ZALOPAY_INVALID_AMOUNT);
        }
        if (payment.getGatewayOrderId() == null) payment.setGatewayOrderId(client.newTransactionId());
        if (client.paymentWindowElapsed(payment.getGatewayOrderId())) {
            throw new AppException(ErrorCode.ZALOPAY_GATEWAY_UNAVAILABLE);
        }
        return new Attempt(payment.getGatewayOrderId(), amount, payment.getGatewayPayUrl());
    }

    @Override
    public boolean acceptCallback(ZalopayCallbackRequest request) {
        CallbackData callback = client.verifyCallback(request.data(), request.mac(), request.type()).orElse(null);
        if (callback == null) return false;
        Long orderId = payments.findOrderIdByGatewayOrderId(callback.transactionId()).orElse(null);
        if (orderId == null) return false;
        // The published demo key is shared. Confirm the payment against the provider before updating local state.
        QueryResult verified = client.query(callback.transactionId()).orElse(null);
        if (verified == null || !verified.succeeded() || !callback.amount().equals(verified.amount())
                || !callback.providerId().equals(verified.providerId())) return false;
        return Boolean.TRUE.equals(transactions.execute(status -> applyCallback(orderId, callback)));
    }

    private boolean applyCallback(Long orderId, CallbackData callback) {
        Order order = lockOrder(orderId);
        Payment payment = lockPayment(orderId);
        if (payment.getMethod() != PaymentMethod.ZALOPAY || !callback.transactionId().equals(payment.getGatewayOrderId())
                || !matchesAmount(order, payment, callback.amount())) return false;
        if (payment.getStatus() == PaymentStatus.PAID) {
            return callback.providerId().toString().equals(payment.getTransactionRef());
        }
        if (order.getStatus() != OrderStatus.PENDING || !isPending(payment, callback.transactionId())) return false;
        recordPayment(order, payment, callback.providerId());
        return true;
    }

    @Override
    public void reconcilePending(Long orderId) {
        payments.findByOrderId(orderId)
                .filter(payment -> payment.getMethod() == PaymentMethod.ZALOPAY && payment.getStatus() == PaymentStatus.PENDING
                        && payment.getGatewayOrderId() != null)
                .ifPresent(payment -> {
                    String transactionId = payment.getGatewayOrderId();
                    client.query(transactionId).ifPresent(result -> transactions.executeWithoutResult(
                            status -> applyQueryResult(orderId, transactionId, result)));
                });
    }

    private void applyQueryResult(Long orderId, String transactionId, QueryResult result) {
        Order order = lockOrder(orderId);
        Payment payment = lockPayment(orderId);
        if (order.getStatus() != OrderStatus.PENDING || !isPending(payment, transactionId)) return;
        if (result.succeeded() && matchesAmount(order, payment, result.amount())) {
            recordPayment(order, payment, result.providerId());
        } else if (result.expired() || (result.notFound() && payment.getGatewayPayUrl() == null
                && client.paymentWindowElapsed(transactionId))) {
            payment.setStatus(PaymentStatus.FAILED);
        }
    }

    private void recordPayment(Order order, Payment payment, Long providerId) {
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        payment.setTransactionRef(providerId.toString());
        events.publishEvent(new PaymentSuccessEvent(order.getId()));
    }

    private static boolean matchesAmount(Order order, Payment payment, Long amount) {
        return amount != null && amount > 0
                && payment.getAmount().compareTo(BigDecimal.valueOf(amount)) == 0
                && payment.getAmount().compareTo(order.getTotalAmount()) == 0;
    }

    private static boolean isPending(Payment payment, String transactionId) {
        return payment.getMethod() == PaymentMethod.ZALOPAY && payment.getStatus() == PaymentStatus.PENDING
                && transactionId.equals(payment.getGatewayOrderId());
    }

    private Order lockOrder(Long orderId) {
        return orders.findByIdForUpdate(orderId).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    private Payment lockPayment(Long orderId) {
        return payments.findByOrderIdForUpdate(orderId).orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
    }

    private record Attempt(String transactionId, long amount, String payUrl) {
    }
}
