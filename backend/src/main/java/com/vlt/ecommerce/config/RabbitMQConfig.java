package com.vlt.ecommerce.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class RabbitMQConfig {

    // ================= 1. HÀNG ĐỢI THÔNG BÁO (NOTIFICATION) =================
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String NOTIFICATION_QUEUE = "notification.queue";
    public static final String NOTIFICATION_ROUTING_KEY = "notification.routing.key";

    // ================= 2. HÀNG ĐỢI HỦY ĐƠN HÀNG HẾT HẠN (DELAY + DEAD LETTER QUEUE) =================
    public static final String ORDER_DELAY_EXCHANGE = "order.delay.exchange";
    public static final String ORDER_DELAY_QUEUE = "order.delay.queue";
    public static final String ORDER_DELAY_ROUTING_KEY = "order.delay.routing.key";

    public static final String ORDER_CANCEL_EXCHANGE = "order.cancel.exchange";
    public static final String ORDER_CANCEL_QUEUE = "order.cancel.queue";
    public static final String ORDER_CANCEL_ROUTING_KEY = "order.cancel.routing.key";


    // --- Message Converter (Jackson JSON) ---
    @Bean
    public MessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        objectMapper.findAndRegisterModules();
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }

    // --- Cấu hình Beans cho Notification ---
    @Bean
    public DirectExchange notificationExchange() {
        return new DirectExchange(NOTIFICATION_EXCHANGE, true, false);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, DirectExchange notificationExchange) {
        return BindingBuilder.bind(notificationQueue).to(notificationExchange).with(NOTIFICATION_ROUTING_KEY);
    }

    // --- Cấu hình Beans cho Order Auto-Cancellation (Dead Letter Queue) ---
    @Bean
    public DirectExchange orderDelayExchange() {
        return new DirectExchange(ORDER_DELAY_EXCHANGE, true, false);
    }

    @Bean
    public DirectExchange orderCancelExchange() {
        return new DirectExchange(ORDER_CANCEL_EXCHANGE, true, false);
    }

    @Bean
    public Queue orderCancelQueue() {
        return new Queue(ORDER_CANCEL_QUEUE, true);
    }

    @Bean
    public Binding orderCancelBinding(Queue orderCancelQueue, DirectExchange orderCancelExchange) {
        return BindingBuilder.bind(orderCancelQueue).to(orderCancelExchange).with(ORDER_CANCEL_ROUTING_KEY);
    }

    @Bean
    public Queue orderDelayQueue() {
        Map<String, Object> args = new HashMap<>();
        // Khi tin nhắn hết hạn (TTL), RabbitMQ sẽ chuyển vào Dead Letter Exchange (DLX)
        args.put("x-dead-letter-exchange", ORDER_CANCEL_EXCHANGE);
        args.put("x-dead-letter-routing-key", ORDER_CANCEL_ROUTING_KEY);
        // Không cố định x-message-ttl trên Queue -> Cho phép từng Message tự mang TTL riêng từ file config

        return new Queue(ORDER_DELAY_QUEUE, true, false, false, args);
    }

    @Bean
    public Binding orderDelayBinding(Queue orderDelayQueue, DirectExchange orderDelayExchange) {
        return BindingBuilder.bind(orderDelayQueue).to(orderDelayExchange).with(ORDER_DELAY_ROUTING_KEY);
    }
}
