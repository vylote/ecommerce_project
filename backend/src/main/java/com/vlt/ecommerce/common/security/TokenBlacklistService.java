package com.vlt.ecommerce.common.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final StringRedisTemplate redisTemplate;
    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";

    // Đưa SSID vào danh sách đen kèm thời gian sống (TTL)
    public void blacklistSsid(String ssid, long remainingTtlMillis) {
        if (remainingTtlMillis > 0) {
            redisTemplate.opsForValue().set(
                BLACKLIST_PREFIX + ssid, 
                "revoked", 
                remainingTtlMillis, 
                TimeUnit.MILLISECONDS
            );
        }
    }

    // Filter sẽ gọi hàm này để chặn request
    public boolean isSsidBlacklisted(String ssid) {
        if (ssid == null) return false;
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + ssid));
    }
}