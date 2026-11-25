package com.vlt.ecommerce.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vlt.ecommerce.domain.Permission;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);

    @Query("SELECT r.id FROM Role r JOIN r.permissions p WHERE p.id = :permissionId")
    List<Long> findRoleIdsByPermissionId(@Param("permissionId") Long permissionId);
}
