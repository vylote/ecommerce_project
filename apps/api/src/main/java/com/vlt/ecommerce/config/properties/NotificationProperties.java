package com.vlt.ecommerce.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties("notification")
public record NotificationProperties(@NotBlank String serviceUrl) {
}
