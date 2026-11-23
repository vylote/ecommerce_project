package com.vlt.ecommerce.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties("jwt")
public record JwtProperties(@NotBlank String secret) {

    @Override
    public String toString() {
        return "JwtProperties[secret redacted]";
    }
}
