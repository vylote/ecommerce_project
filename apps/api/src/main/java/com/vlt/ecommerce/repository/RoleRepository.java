package com.vlt.ecommerce.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vlt.ecommerce.domain.Role;
import com.vlt.ecommerce.repository.projection.RolePermissionEntry;

import jakarta.persistence.LockModeType;

public interface RoleRepository extends JpaRepository<Role, Long>{
    Optional<Role> findByName(String name);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Role e WHERE e.id = :roleId")
    Optional<Role> findByIdForUpdate(@Param("roleId") Long roleId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Role r WHERE r.name = :name")
    Optional<Role> findByNameForUpdate(@Param("name") String name);

    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("SELECT r FROM Role r WHERE r.id IN :ids ORDER BY r.id")
    List<Role> findForUserAssignment(@Param("ids") Collection<Long> ids);

    @Query("SELECT r.name AS roleName, p.name AS permissionName FROM Role r LEFT JOIN r.permissions p WHERE r.name = :roleName")
    List<RolePermissionEntry> findRolePermissions(@Param("roleName") String roleName);

    default Role getRequiredSystemRole(String name) {
        return findByName(name)
                .orElseThrow(() -> new IllegalStateException("Missing system role: " + name));
    }
}
