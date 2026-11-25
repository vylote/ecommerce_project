package com.vlt.ecommerce.integration.redis;

import java.util.Optional;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.integration.redis.RolePermissionCache.CachedRole;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RolePermissionCacheStore {

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    Optional<CachedRole> find(String roleName) {
        String value = redis.opsForValue().get(key(roleName));
        if (value == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(value, CachedRole.class));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Cannot read cached role permissions", e);
        }
    }

    boolean saveIfAbsent(String roleName, CachedRole role) {
        return Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(
                key(roleName), serialize(role), Constants.AUTHORIZATION_CACHE_TTL));
    }

    void save(String roleName, CachedRole role) {
        redis.opsForValue().set(key(roleName), serialize(role), Constants.AUTHORIZATION_CACHE_TTL);
    }

    void evict(String roleName) {
        redis.delete(key(roleName));
    }

    private String serialize(CachedRole role) {
        try {
            return objectMapper.writeValueAsString(role);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Cannot write cached role permissions", e);
        }
    }

    private String key(String roleName) {
        return Constants.ROLE_PERMISSION_CACHE_PREFIX + roleName;
    }
}
