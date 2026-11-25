package com.vlt.ecommerce.integration.redis;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionException;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.vlt.ecommerce.domain.Permission;
import com.vlt.ecommerce.repository.RoleRepository;
import com.vlt.ecommerce.repository.projection.RolePermissionEntry;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class RolePermissionCache {

    private final RolePermissionCacheStore store;
    private final RoleRepository roleRepository;
    private final PlatformTransactionManager transactionManager;

    public Optional<CachedRole> findRole(String roleName) {
        return store.find(roleName)
                .or(() -> Optional.of(loadAndCache(roleName)))
                .filter(role -> role.name() != null);
    }

    public void refreshAfterCommit(Collection<String> roleNames) {
        List<String> names = roleNames.stream().distinct().toList();
        if (names.isEmpty()) {
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                TransactionTemplate transaction = new TransactionTemplate(transactionManager);
                transaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
                for (String name : names) {
                    try {
                        transaction.executeWithoutResult(status -> refresh(name));
                    } catch (DataAccessException | TransactionException e) {
                        log.warn("Could not refresh cached permissions for role {}", name, e);
                        evictAfterRefreshFailure(name);
                    }
                }
            }
        });
    }

    private CachedRole loadAndCache(String roleName) {
        List<RolePermissionEntry> entries = roleRepository.findRolePermissions(roleName);
        CachedRole role = entries.isEmpty()
                ? missingRole()
                : new CachedRole(entries.getFirst().getRoleName(), entries.stream()
                        .map(RolePermissionEntry::getPermissionName)
                        .filter(Objects::nonNull)
                        .toList());

        // A permission update can publish a newer complete list while the miss reads MySQL.
        return store.saveIfAbsent(roleName, role) ? role : store.find(roleName).orElse(role);
    }

    private void refresh(String roleName) {
        // Serialize concurrent publications and read the committed permissions under the role lock.
        CachedRole role = roleRepository.findByNameForUpdate(roleName)
                .map(current -> new CachedRole(current.getName(),
                        current.getPermissions().stream().map(Permission::getName).toList()))
                .orElseGet(this::missingRole);
        store.save(roleName, role);
    }

    private CachedRole missingRole() {
        return new CachedRole(null, List.of());
    }

    private void evictAfterRefreshFailure(String roleName) {
        try {
            store.evict(roleName);
        } catch (DataAccessException e) {
            log.warn("Could not evict cached permissions for role {}", roleName, e);
        }
    }

    public record CachedRole(String name, List<String> permissions) {}
}
