package com.vlt.ecommerce.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vlt.ecommerce.domain.Role;

public interface RoleRepository extends JpaRepository<Role, Long>{
    Optional<Role> findByName(String name);

    default Role getRequiredSystemRole(String name) {
        return findByName(name)
                .orElseThrow(() -> new IllegalStateException("Missing system role: " + name));
    }
}
