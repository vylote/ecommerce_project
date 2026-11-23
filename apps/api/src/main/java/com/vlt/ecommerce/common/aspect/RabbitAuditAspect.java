package com.vlt.ecommerce.common.aspect;

import java.lang.reflect.Method;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.vlt.ecommerce.feature.notification.dto.NotificationMessage;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Aspect
@Component
public class RabbitAuditAspect {

    @Around("@annotation(org.springframework.amqp.rabbit.annotation.RabbitListener) || @annotation(com.vlt.ecommerce.common.annotation.RabbitAudit)")
    public Object auditRabbitConsumer(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        RabbitListener rabbitListener = method.getAnnotation(RabbitListener.class);

        String queueName = "UNKNOWN_QUEUE";
        if (rabbitListener != null && rabbitListener.queues().length > 0) {
            queueName = String.join(", ", rabbitListener.queues());
        }

        Object[] args = joinPoint.getArgs();
        String payloadInfo = "N/A";
        Long queueLatencyMs = null;

        if (args != null && args.length > 0) {
            Object firstArg = args[0];
            if (firstArg instanceof NotificationMessage notifMsg) {
                payloadInfo = String.format("Notification #%s | Type: %s | Title: \"%s\" | Ref: #%s",
                        notifMsg.getId(), notifMsg.getType(), notifMsg.getTitle(), notifMsg.getRefId());
                if (notifMsg.getSentTimestamp() != null) {
                    queueLatencyMs = startTime - notifMsg.getSentTimestamp();
                }
            } else if (firstArg instanceof Long orderId) {
                payloadInfo = "Order ID #" + orderId;
            } else if (firstArg != null) {
                payloadInfo = firstArg.toString();
            }
        }

        log.info("--- [RABBITMQ INCOMING] ---------------------------------------------");
        log.info("Queue           : {}", queueName);
        log.info("Consumer        : {}.{}()", method.getDeclaringClass().getSimpleName(), method.getName());
        log.info("Payload         : {}", payloadInfo);
        if (queueLatencyMs != null) {
            log.info("Queue Latency   : {} ms", queueLatencyMs);
        }
        log.info("-------------------------------------------------------------------------");

        try {
            Object result = joinPoint.proceed();
            long executionTimeMs = System.currentTimeMillis() - startTime;

            log.info("--- [RABBITMQ ACK SUCCESS] ---------------------------------------");
            log.info("Queue           : {}", queueName);
            log.info("Execution Speed : {} ms", executionTimeMs);
            log.info("Status          : COMPLETED & ACK SENT");
            log.info("-------------------------------------------------------------------------");

            return result;
        } catch (Throwable ex) {
            long executionTimeMs = System.currentTimeMillis() - startTime;

            log.error("--- [RABBITMQ FAILED] --------------------------------------------");
            log.error("Queue           : {}", queueName);
            log.error("Execution Time  : {} ms", executionTimeMs);
            log.error("Error Detail    : {}", ex.getMessage());
            log.error("-------------------------------------------------------------------------");

            throw ex;
        }
    }
}
