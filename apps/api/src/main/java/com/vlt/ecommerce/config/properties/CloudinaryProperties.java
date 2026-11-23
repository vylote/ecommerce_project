package com.vlt.ecommerce.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties("cloudinary")
public record CloudinaryProperties(
        @NotBlank String cloudName,
        @NotBlank String apiKey,
        @NotBlank String apiSecret) {

    @Override
    public String toString() {
        return "CloudinaryProperties[credentials redacted]";
    }
}
