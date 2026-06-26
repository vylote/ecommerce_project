package com.vlt.ecommerce.common.event;

import org.springframework.context.ApplicationEvent;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderStatusChangedEvent extends ApplicationEvent{
    Long orderId;

    public OrderStatusChangedEvent(Object source, Long orderId) {
        super(source);
        this.orderId = orderId;
    }
}
