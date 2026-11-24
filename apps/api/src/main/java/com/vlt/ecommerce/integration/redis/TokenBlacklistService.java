package com.vlt.ecommerce.integration.redis;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.vlt.ecommerce.config.Constants;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final StringRedisTemplate redisTemplate;

    public void blacklistSsid(String ssid, long remainingTtlMillis) {
        if (remainingTtlMillis > 0) {
            redisTemplate.opsForValue().set(
                Constants.JWT_BLACKLIST_PREFIX + ssid,
                "revoked", 
                Duration.ofMillis(remainingTtlMillis)
            );
        }
    }

    public boolean isSsidBlacklisted(String ssid) {
        if (ssid == null) return false;
        return Boolean.TRUE.equals(redisTemplate.hasKey(Constants.JWT_BLACKLIST_PREFIX + ssid));
    }
}