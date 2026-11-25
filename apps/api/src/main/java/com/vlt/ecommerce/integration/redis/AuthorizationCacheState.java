package com.vlt.ecommerce.integration.redis;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.function.Supplier;
import java.util.stream.IntStream;

import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vlt.ecommerce.config.Constants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthorizationCacheState {

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;
    private final RedisScript<String> stableGenerationScript =
            RedisScript.of(Constants.AUTHORIZATION_STABLE_GENERATION_SCRIPT, String.class);
    private final RedisScript<Long> writeIfCurrentScript =
            RedisScript.of(Constants.AUTHORIZATION_WRITE_CACHE_SCRIPT, Long.class);
    private final RedisScript<Long> finishMutationScript =
            RedisScript.of(Constants.AUTHORIZATION_FINISH_MUTATION_SCRIPT, Long.class);
    private final Queue<Invalidation> pendingInvalidations = new ConcurrentLinkedQueue<>();
    // Reuse 32 locks per API process to load different keys in parallel with a fixed number of locks.
    private final List<Object> missLocks = IntStream.range(0, Constants.AUTHORIZATION_CACHE_LOCK_COUNT)
            .mapToObj(index -> new Object())
            .toList();

    // The Redis hash normally holds only the generation. A pending write makes the Lua script return null.
    String stableGeneration() {
        retryInvalidation();
        return redis.execute(stableGenerationScript, List.of(Constants.AUTHORIZATION_CACHE_STATE_KEY),
                UUID.randomUUID().toString());
    }

    <T> T getOrLoad(String key, String generation, Class<T> type, Supplier<T> loader) {
        // Ignore snapshots restored from an earlier Redis process.
        String instancePrefix = generation.substring(0, generation.indexOf(':') + 1);
        Optional<T> cached = read(key, instancePrefix, type);
        if (cached.isPresent()) {
            return cached.get();
        }

        // The same key always selects the same lock. Different keys can share a lock.
        Object lock = missLocks.get(Math.floorMod(key.hashCode(), missLocks.size()));
        synchronized (lock) {
            // Read Redis again after waiting. A previous request may have loaded the key from MySQL.
            return read(key, instancePrefix, type).orElseGet(() -> {
                T value = loader.get();
                writeIfCurrent(key, generation, instancePrefix, value);
                return value;
            });
        }
    }

    void invalidateAfterTransaction(Supplier<List<String>> affectedKeys) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()
                || !TransactionSynchronizationManager.isSynchronizationActive()) {
            throw new IllegalStateException("Authorization cache invalidation requires an active transaction");
        }

        String marker = UUID.randomUUID().toString();
        List<String> keys = new ArrayList<>();
        keys.add(Constants.AUTHORIZATION_CACHE_STATE_KEY);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void beforeCommit(boolean readOnly) {
                if (!Boolean.TRUE.equals(redis.opsForHash().hasKey(Constants.AUTHORIZATION_CACHE_STATE_KEY, marker))) {
                    throw new IllegalStateException("Authorization update lost its Redis invalidation marker");
                }
            }

            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_UNKNOWN) {
                    log.error("Authorization transaction outcome unknown, keeping cache invalidation marker");
                    return;
                }
                Invalidation invalidation = new Invalidation(List.copyOf(keys), marker);
                try {
                    finish(invalidation);
                } catch (DataAccessException e) {
                    pendingInvalidations.add(invalidation);
                    log.warn("Authorization cache invalidation will retry on the next request");
                }
            }
        });
        // Mark the write before MySQL changes so overlapping requests read the database.
        redis.opsForHash().putAll(Constants.AUTHORIZATION_CACHE_STATE_KEY,
                Map.of("generation", UUID.randomUUID().toString(), marker, "pending"));
        keys.addAll(affectedKeys.get());
    }

    private <T> Optional<T> read(String key, String instancePrefix, Class<T> type) {
        String value = redis.opsForValue().get(key);
        if (value == null || !value.startsWith(instancePrefix)) {
            return Optional.empty();
        }
        try {
            return Optional.ofNullable(objectMapper.readValue(value.substring(instancePrefix.length()), type));
        } catch (JsonProcessingException e) {
            log.warn("Could not decode an authorization cache entry");
            return Optional.empty();
        }
    }

    private void writeIfCurrent(String key, String generation, String instancePrefix, Object value) {
        try {
            redis.execute(writeIfCurrentScript, List.of(Constants.AUTHORIZATION_CACHE_STATE_KEY, key),
                    generation, instancePrefix + objectMapper.writeValueAsString(value),
                    Long.toString(Constants.AUTHORIZATION_CACHE_TTL.toMillis()));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not serialize an authorization cache entry", e);
        }
    }

    private void retryInvalidation() {
        Invalidation invalidation = pendingInvalidations.peek();
        if (invalidation != null) {
            finish(invalidation);
            pendingInvalidations.remove(invalidation);
        }
    }

    private void finish(Invalidation invalidation) {
        // Lua evicts the affected cache keys, advances the generation, and removes the marker atomically.
        redis.execute(finishMutationScript, invalidation.keys(), invalidation.marker(),
                UUID.randomUUID().toString());
    }

    private record Invalidation(List<String> keys, String marker) {}
}
