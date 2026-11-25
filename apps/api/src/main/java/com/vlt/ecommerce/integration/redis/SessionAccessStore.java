package com.vlt.ecommerce.integration.redis;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import com.vlt.ecommerce.config.Constants;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SessionAccessStore {

    private final StringRedisTemplate redis;

    public void allow(String sessionId, Long userId) {
        redis.opsForValue().set(key(sessionId), userId.toString(),
                Duration.ofSeconds(Constants.ACCESS_COOKIE_MAX_AGE_SECONDS));
    }

    public boolean isActive(String sessionId, Long userId) {
        return userId.toString().equals(redis.opsForValue().get(key(sessionId)));
    }

    public void revoke(String sessionId) {
        redis.delete(key(sessionId));
    }

    private String key(String sessionId) {
        return Constants.ACTIVE_SESSION_KEY_PREFIX + sessionId;
    }
}
