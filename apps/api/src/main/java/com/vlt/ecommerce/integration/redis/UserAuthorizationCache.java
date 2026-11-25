package com.vlt.ecommerce.integration.redis;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import org.springframework.dao.DataAccessException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.domain.Permission;
import com.vlt.ecommerce.domain.Role;
import com.vlt.ecommerce.repository.PermissionRepository;
import com.vlt.ecommerce.repository.UserRepository;
import com.vlt.ecommerce.repository.projection.UserAuthorizationRole;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserAuthorizationCache {

    private final AuthorizationCacheState state;
    private final RolePermissionCache roleCache;
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;

    // decide reading from Redis or MySQL
    public Optional<Set<SimpleGrantedAuthority>> resolveAuthorities(Long userId) {
        try {
            //read current time before
            String generation = state.stableGeneration();
            if (generation != null) {
                Optional<Set<SimpleGrantedAuthority>> cached = loadThroughCache(userId, generation);
                // A write can start and finish during these reads. Compare generations to catch it.
                if (generation.equals(state.stableGeneration())) {
                    return cached;
                }
            }
        } catch (DataAccessException e) {
            return loadCurrentAuthorities(userId);
        }
        return loadCurrentAuthorities(userId);
    }

    public void userChanged(Long userId) {
        state.invalidateAfterTransaction(() -> List.of(userKey(userId)));
    }

    public void roleChanged(Long roleId) {
        state.invalidateAfterTransaction(() -> List.of(RolePermissionCache.key(roleId)));
    }

    public void permissionChanged(Long permissionId) {
        state.invalidateAfterTransaction(() -> permissionRepository.findRoleIdsByPermissionId(permissionId).stream()
                .map(RolePermissionCache::key)
                .toList());
    }

    private Optional<Set<SimpleGrantedAuthority>> loadThroughCache(Long userId, String generation) {
        CachedUser user = state.getOrLoad(userKey(userId), generation, CachedUser.class, () -> loadUser(userId));
        if (!user.active()) {
            return Optional.empty();
        }

        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        // Keep permissions shared by role so a grant change only evicts the affected role cache.
        for (Long roleId : user.roleIds()) {
            RolePermissionCache.CachedRole role = roleCache.getRole(roleId, generation);
            if (role.name() != null) {
                addAuthorities(authorities, role.name(), role.permissions());
            }
        }
        return Optional.of(authorities);
    }

    private CachedUser loadUser(Long userId) {
        List<UserAuthorizationRole> roles = userRepository.findAuthorizationRoles(userId);
        return new CachedUser(!roles.isEmpty(), roles.stream()
                .map(UserAuthorizationRole::getRoleId)
                .filter(Objects::nonNull)
                .toList());
    }

    private Optional<Set<SimpleGrantedAuthority>> loadCurrentAuthorities(Long userId) {
        return userRepository.findById(userId)
                .filter(user -> Boolean.TRUE.equals(user.getIsActive()))
                .map(user -> {
                    Set<SimpleGrantedAuthority> authorities = new HashSet<>();
                    for (Role role : user.getRoles()) {
                        addAuthorities(authorities, role.getName(),
                                role.getPermissions().stream().map(Permission::getName).toList());
                    }
                    return authorities;
                });
    }

    private void addAuthorities(Set<SimpleGrantedAuthority> authorities, String role, List<String> permissions) {
        authorities.add(new SimpleGrantedAuthority(role));
        permissions.stream().map(SimpleGrantedAuthority::new).forEach(authorities::add);
    }

    private String userKey(Long userId) {
        return Constants.USER_AUTHORIZATION_CACHE_PREFIX + userId;
    }

    public record CachedUser(boolean active, List<Long> roleIds) {}
}
