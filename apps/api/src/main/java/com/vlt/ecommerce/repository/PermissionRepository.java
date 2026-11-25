package com.vlt.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vlt.ecommerce.domain.Permission;

import jakarta.persistence.LockModeType;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Permission e WHERE e.id = :id")
    Optional<Permission> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("SELECT p FROM Permission p WHERE p.id IN :ids ORDER BY p.id")
    List<Permission> findForRoleAssignment(@Param("ids") List<Long> ids);

    @Query("SELECT r.name FROM Role r JOIN r.permissions p WHERE p.id = :permissionId")
    List<String> findRoleNamesByPermissionId(@Param("permissionId") Long permissionId);
}
