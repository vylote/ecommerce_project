package com.vlt.ecommerce.security;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import com.vlt.ecommerce.integration.redis.RolePermissionCache;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RoleAuthorityResolver {

    private final RolePermissionCache rolePermissionCache;

    public Set<SimpleGrantedAuthority> resolve(List<String> roleNames) {
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        for (String roleName : roleNames) {
            rolePermissionCache.findRole(roleName).ifPresent(role -> {
                authorities.add(new SimpleGrantedAuthority(role.name()));
                role.permissions().stream().map(SimpleGrantedAuthority::new).forEach(authorities::add);
            });
        }
        return authorities;
    }
}
