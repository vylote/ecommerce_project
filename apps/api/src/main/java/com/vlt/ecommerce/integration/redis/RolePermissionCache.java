package com.vlt.ecommerce.integration.redis;

import java.util.List;

import org.springframework.stereotype.Component;

import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.domain.Permission;
import com.vlt.ecommerce.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RolePermissionCache {

    private final AuthorizationCacheState state;
    private final RoleRepository roleRepository;

    CachedRole getRole(Long roleId, String generation) {
        return state.getOrLoad(key(roleId), generation, CachedRole.class, () -> roleRepository.findById(roleId)
                .map(role -> new CachedRole(role.getName(), role.getPermissions().stream().map(Permission::getName).toList()))
                .orElseGet(() -> new CachedRole(null, List.of())));
    }

    static String key(Long roleId) {
        return Constants.ROLE_PERMISSION_CACHE_PREFIX + roleId;
    }

    public record CachedRole(String name, List<String> permissions) {}
}
