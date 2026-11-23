package com.vlt.ecommerce.service;

import java.util.List;

import com.vlt.ecommerce.service.dto.request.PermissionRequest;
import com.vlt.ecommerce.service.dto.request.RoleRequest;
import com.vlt.ecommerce.service.dto.request.UserRoleAssignRequest;
import com.vlt.ecommerce.service.dto.response.PermissionResponse;
import com.vlt.ecommerce.service.dto.response.RoleResponse;
import com.vlt.ecommerce.service.dto.response.UserResponse;

public interface RolePermissionService {

    List<RoleResponse> getAllRoles();

    RoleResponse getRoleById(Long id);

    RoleResponse createRole(RoleRequest request);

    RoleResponse updateRole(Long id, RoleRequest request);

    void deleteRole(Long id);

    List<PermissionResponse> getAllPermissions();

    PermissionResponse createPermission(PermissionRequest request);

    PermissionResponse updatePermission(Long id, PermissionRequest request);

    void deletePermission(Long id);

    UserResponse assignRolesToUser(Long userId, UserRoleAssignRequest request);
}
