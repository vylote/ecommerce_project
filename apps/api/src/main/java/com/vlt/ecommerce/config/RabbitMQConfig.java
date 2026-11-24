package com.vlt.ecommerce.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.DefaultJacksonJavaTypeMapper;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.vlt.ecommerce.integration.rabbitmq.dto.NotificationMessage;

import tools.jackson.databind.json.JsonMapper;

@Configuration
public class RabbitMQConfig {

    @Bean
    public MessageConverter jsonMessageConverter() {
        // Preserve the wire type ID for messages queued before the package move.
        DefaultJacksonJavaTypeMapper typeMapper = new DefaultJacksonJavaTypeMapper();
        typeMapper.setIdClassMapping(Map.of(
                "com.vlt.ecommerce.feature.notification.dto.NotificationMessage", NotificationMessage.class
        ));

        JsonMapper rabbitMapper = JsonMapper.builderWithJackson2Defaults().build();
        JacksonJsonMessageConverter converter = new JacksonJsonMessageConverter(rabbitMapper);
        converter.setJavaTypeMapper(typeMapper);
        return converter;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }

    // --- Cấu hình Beans cho Notification Fanout Exchange & Queues ---
    @Bean
    public FanoutExchange notificationFanoutExchange() {
        return new FanoutExchange(Constants.NOTIFICATION_FANOUT_EXCHANGE, true, false);
    }

    @Bean
    public DirectExchange notificationExchange() {
        return new DirectExchange(Constants.NOTIFICATION_EXCHANGE, true, false);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(Constants.NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Queue notificationEmailQueue() {
        return new Queue(Constants.NOTIFICATION_EMAIL_QUEUE, true);
    }

    @Bean
    public Queue notificationSmsQueue() {
        return new Queue(Constants.NOTIFICATION_SMS_QUEUE, true);
    }

    // 1. Binding Web Push Queue tới Fanout Exchange
    @Bean
    public Binding notificationWebFanoutBinding(Queue notificationQueue, FanoutExchange notificationFanoutExchange) {
        return BindingBuilder.bind(notificationQueue).to(notificationFanoutExchange);
    }

    // 2. Binding Email Queue tới Fanout Exchange
    @Bean
    public Binding notificationEmailFanoutBinding(Queue notificationEmailQueue, FanoutExchange notificationFanoutExchange) {
        return BindingBuilder.bind(notificationEmailQueue).to(notificationFanoutExchange);
    }

    // 3. Binding SMS Queue tới Fanout Exchange
    @Bean
    public Binding notificationSmsFanoutBinding(Queue notificationSmsQueue, FanoutExchange notificationFanoutExchange) {
        return BindingBuilder.bind(notificationSmsQueue).to(notificationFanoutExchange);
    }

    // Direct Binding cũ để duy trì tương thích
    @Bean
    public Binding notificationBinding(Queue notificationQueue, DirectExchange notificationExchange) {
        return BindingBuilder.bind(notificationQueue).to(notificationExchange).with(Constants.NOTIFICATION_ROUTING_KEY);
    }

    // --- Cấu hình Beans cho Order Auto-Cancellation (Dead Letter Queue) ---
    @Bean
    public DirectExchange orderDelayExchange() {
        return new DirectExchange(Constants.ORDER_DELAY_EXCHANGE, true, false);
    }

    @Bean
    public DirectExchange orderCancelExchange() {
        return new DirectExchange(Constants.ORDER_CANCEL_EXCHANGE, true, false);
    }

    @Bean
    public Queue orderCancelQueue() {
        return new Queue(Constants.ORDER_CANCEL_QUEUE, true);
    }

    @Bean
    public Binding orderCancelBinding(Queue orderCancelQueue, DirectExchange orderCancelExchange) {
        return BindingBuilder.bind(orderCancelQueue).to(orderCancelExchange).with(Constants.ORDER_CANCEL_ROUTING_KEY);
    }

    @Bean
    public Queue orderDelayQueue() {
        Map<String, Object> args = new HashMap<>();
        // Khi tin nhắn hết hạn (TTL), RabbitMQ sẽ chuyển vào Dead Letter Exchange (DLX)
        args.put("x-dead-letter-exchange", Constants.ORDER_CANCEL_EXCHANGE);
        args.put("x-dead-letter-routing-key", Constants.ORDER_CANCEL_ROUTING_KEY);
        // Không cố định x-message-ttl trên Queue -> Cho phép từng Message tự mang TTL riêng từ file config

        return new Queue(Constants.ORDER_DELAY_QUEUE, true, false, false, args);
    }

    @Bean
    public Binding orderDelayBinding(Queue orderDelayQueue, DirectExchange orderDelayExchange) {
        return BindingBuilder.bind(orderDelayQueue).to(orderDelayExchange).with(Constants.ORDER_DELAY_ROUTING_KEY);
    }
}
