package com.vlt.ecommerce.config.properties;

import java.net.URI;
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

@ConfigurationProperties("app.payment.zalopay")
public record ZalopayProperties(boolean enabled, int appId, String key1, String key2, URI callbackUrl, URI redirectUrl, Duration timeout) {
    public boolean configured() {
        return enabled && appId > 0 && StringUtils.hasText(key1) && StringUtils.hasText(key2)
                && (!hasCallback() || ("https".equalsIgnoreCase(callbackUrl.getScheme()) && callbackUrl.getHost() != null))
                && redirectUrl != null && redirectUrl.getHost() != null
                && ("http".equalsIgnoreCase(redirectUrl.getScheme()) || "https".equalsIgnoreCase(redirectUrl.getScheme()));
    }

    public boolean hasCallback() {
        return callbackUrl != null && !callbackUrl.toString().isBlank();
    }

    @Override
    public String toString() {
        return "ZalopayProperties[configured=" + configured() + "]";
    }
}
