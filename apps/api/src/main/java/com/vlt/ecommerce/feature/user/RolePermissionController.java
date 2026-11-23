package com.vlt.ecommerce.feature.user;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.feature.user.dto.request.PermissionRequest;
import com.vlt.ecommerce.feature.user.dto.request.RoleRequest;
import com.vlt.ecommerce.feature.user.dto.request.UserRoleAssignRequest;
import com.vlt.ecommerce.feature.user.dto.response.PermissionResponse;
import com.vlt.ecommerce.feature.user.dto.response.RoleResponse;
import com.vlt.ecommerce.feature.user.dto.response.UserResponse;
import com.vlt.ecommerce.feature.user.service.RolePermissionService;

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

    // ================= ROLES =================
    @GetMapping("/roles")
    public ApiResponse<List<RoleResponse>> getAllRoles() {
        return ApiResponse.<List<RoleResponse>>builder()
                .result(rolePermissionService.getAllRoles())
                .build();
    }

    @GetMapping("/roles/{id}")
    public ApiResponse<RoleResponse> getRoleById(@PathVariable Long id) {
        return ApiResponse.<RoleResponse>builder()
                .result(rolePermissionService.getRoleById(id))
                .build();
    }

    @PostMapping("/roles")
    public ApiResponse<RoleResponse> createRole(@RequestBody @Valid RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(rolePermissionService.createRole(request))
                .build();
    }

    @PutMapping("/roles/{id}")
    public ApiResponse<RoleResponse> updateRole(
            @PathVariable Long id,
            @RequestBody @Valid RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(rolePermissionService.updateRole(id, request))
                .build();
    }

    @DeleteMapping("/roles/{id}")
    public ApiResponse<String> deleteRole(@PathVariable Long id) {
        rolePermissionService.deleteRole(id);
        return ApiResponse.<String>builder()
                .result("Đã xóa vai trò thành công")
                .build();
    }

    // ================= PERMISSIONS =================
    @GetMapping("/permissions")
    public ApiResponse<List<PermissionResponse>> getAllPermissions() {
        return ApiResponse.<List<PermissionResponse>>builder()
                .result(rolePermissionService.getAllPermissions())
                .build();
    }

    @PostMapping("/permissions")
    public ApiResponse<PermissionResponse> createPermission(@RequestBody @Valid PermissionRequest request) {
        return ApiResponse.<PermissionResponse>builder()
                .result(rolePermissionService.createPermission(request))
                .build();
    }

    @PutMapping("/permissions/{id}")
    public ApiResponse<PermissionResponse> updatePermission(
            @PathVariable Long id,
            @RequestBody @Valid PermissionRequest request) {
        return ApiResponse.<PermissionResponse>builder()
                .result(rolePermissionService.updatePermission(id, request))
                .build();
    }

    @DeleteMapping("/permissions/{id}")
    public ApiResponse<String> deletePermission(@PathVariable Long id) {
        rolePermissionService.deletePermission(id);
        return ApiResponse.<String>builder()
                .result("Đã xóa quyền hạn thành công")
                .build();
    }

    // ================= GÁN ROLE CHO USER =================
    @PutMapping("/users/{userId}/roles")
    public ApiResponse<UserResponse> assignRolesToUser(
            @PathVariable Long userId,
            @RequestBody @Valid UserRoleAssignRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(rolePermissionService.assignRolesToUser(userId, request))
                .build();
    }
}
