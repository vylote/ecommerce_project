package com.vlt.ecommerce.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation ghi log kiểm toán cho RabbitMQ Consumer:
 * - Hàng đợi tiếp nhận (Queue Name)
 * - Tốc độ phản hồi / thời gian thực thi (Execution Time ms)
 * - Thời gian trễ trong hàng đợi (Transit / Latency ms)
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RabbitAudit {
    String value() default "";
}
