package com.vlt.ecommerce.web.rest;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.service.dto.response.ApiResponse;
import com.vlt.ecommerce.service.dto.request.PermissionRequest;
import com.vlt.ecommerce.service.dto.request.RoleRequest;
import com.vlt.ecommerce.service.dto.request.UserRoleAssignRequest;
import com.vlt.ecommerce.service.dto.response.PermissionResponse;
import com.vlt.ecommerce.service.dto.response.RoleResponse;
import com.vlt.ecommerce.service.dto.response.UserResponse;
import com.vlt.ecommerce.service.RolePermissionService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RolePermissionController {
    RolePermissionService rolePermissionService;

    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('ROLE_LIST')")
    public ApiResponse<List<RoleResponse>> getAllRoles() {
        return ApiResponse.<List<RoleResponse>>builder()
                .result(rolePermissionService.getAllRoles())
                .build();
    }

    @GetMapping("/roles/{id}")
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public ApiResponse<RoleResponse> getRoleById(@PathVariable Long id) {
        return ApiResponse.<RoleResponse>builder()
                .result(rolePermissionService.getRoleById(id))
                .build();
    }

    @PostMapping("/roles")
    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public ApiResponse<RoleResponse> createRole(@RequestBody @Valid RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(rolePermissionService.createRole(request))
                .build();
    }

    @PutMapping("/roles/{id}")
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public ApiResponse<RoleResponse> updateRole(
            @PathVariable Long id,
            @RequestBody @Valid RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(rolePermissionService.updateRole(id, request))
                .build();
    }

    @DeleteMapping("/roles/{id}")
    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    public ApiResponse<String> deleteRole(@PathVariable Long id) {
        rolePermissionService.deleteRole(id);
        return ApiResponse.<String>builder()
                .result("Đã xóa vai trò thành công")
                .build();
    }

    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('PERMISSION_LIST')")
    public ApiResponse<List<PermissionResponse>> getAllPermissions() {
        return ApiResponse.<List<PermissionResponse>>builder()
                .result(rolePermissionService.getAllPermissions())
                .build();
    }

    @PostMapping("/permissions")
    @PreAuthorize("hasAuthority('PERMISSION_CREATE')")
    public ApiResponse<PermissionResponse> createPermission(@RequestBody @Valid PermissionRequest request) {
        return ApiResponse.<PermissionResponse>builder()
                .result(rolePermissionService.createPermission(request))
                .build();
    }

    @PutMapping("/permissions/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_UPDATE')")
    public ApiResponse<PermissionResponse> updatePermission(
            @PathVariable Long id,
            @RequestBody @Valid PermissionRequest request) {
        return ApiResponse.<PermissionResponse>builder()
                .result(rolePermissionService.updatePermission(id, request))
                .build();
    }

    @DeleteMapping("/permissions/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_DELETE')")
    public ApiResponse<String> deletePermission(@PathVariable Long id) {
        rolePermissionService.deletePermission(id);
        return ApiResponse.<String>builder()
                .result("Đã xóa quyền hạn thành công")
                .build();
    }

    @PutMapping("/users/{userId}/roles")
    @PreAuthorize("hasAuthority('ROLE_ASSIGN')")
    public ApiResponse<UserResponse> assignRolesToUser(
            @PathVariable Long userId,
            @RequestBody @Valid UserRoleAssignRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(rolePermissionService.assignRolesToUser(userId, request))
                .build();
    }
}
