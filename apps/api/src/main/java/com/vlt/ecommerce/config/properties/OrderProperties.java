package com.vlt.ecommerce.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties("app.order")
public record OrderProperties(@DefaultValue("900000") int expirationTtlMs) {
}
