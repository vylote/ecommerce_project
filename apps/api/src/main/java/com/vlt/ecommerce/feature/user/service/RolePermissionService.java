package com.vlt.ecommerce.feature.user.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.user.Permission;
import com.vlt.ecommerce.feature.user.Role;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.dto.request.PermissionRequest;
import com.vlt.ecommerce.feature.user.dto.request.RoleRequest;
import com.vlt.ecommerce.feature.user.dto.request.UserRoleAssignRequest;
import com.vlt.ecommerce.feature.user.dto.response.PermissionResponse;
import com.vlt.ecommerce.feature.user.dto.response.RoleResponse;
import com.vlt.ecommerce.feature.user.dto.response.UserResponse;
import com.vlt.ecommerce.feature.user.mapper.UserMapper;
import com.vlt.ecommerce.feature.user.repository.PermissionRepository;
import com.vlt.ecommerce.feature.user.repository.RoleRepository;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RolePermissionService {
    RoleRepository roleRepository;
    PermissionRepository permissionRepository;
    UserRepository userRepository;
    UserMapper userMapper;

    // Các vai trò mặc định của hệ thống - không được phép xóa
    static Set<String> SYSTEM_ROLES = Set.of("ROLE_ADMIN", "ROLE_SELLER", "ROLE_BUYER");

    // ================= 1. QUẢN LÝ VAI TRÒ (ROLES) =================
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::toRoleResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public RoleResponse getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return toRoleResponse(role);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public RoleResponse createRole(RoleRequest request) {
        String roleName = request.getName().trim().toUpperCase();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        if (roleRepository.findByName(roleName).isPresent()) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        Set<Permission> permissions = new HashSet<>();
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            permissions.addAll(permissionRepository.findAllById(request.getPermissionIds()));
        }

        Role role = Role.builder()
                .name(roleName)
                .description(request.getDescription())
                .permissions(permissions)
                .build();

        return toRoleResponse(roleRepository.save(role));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public RoleResponse updateRole(Long id, RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        String newRoleName = request.getName().trim().toUpperCase();
        if (!newRoleName.startsWith("ROLE_")) {
            newRoleName = "ROLE_" + newRoleName;
        }

        // Không cho đổi tên các role hệ thống
        if (SYSTEM_ROLES.contains(role.getName()) && !role.getName().equals(newRoleName)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (!role.getName().equals(newRoleName) && roleRepository.findByName(newRoleName).isPresent()) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        role.setName(newRoleName);
        role.setDescription(request.getDescription());

        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(request.getPermissionIds()));
            role.setPermissions(permissions);
        }

        return toRoleResponse(roleRepository.save(role));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (SYSTEM_ROLES.contains(role.getName())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        roleRepository.delete(role);
    }

    // ================= 2. QUẢN LÝ QUYỀN HẠN (PERMISSIONS) =================
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(this::toPermissionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public PermissionResponse createPermission(PermissionRequest request) {
        String permName = request.getName().trim().toUpperCase().replace(" ", "_");

        if (permissionRepository.existsByName(permName)) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        Permission permission = Permission.builder()
                .name(permName)
                .description(request.getDescription())
                .build();

        return toPermissionResponse(permissionRepository.save(permission));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public PermissionResponse updatePermission(Long id, PermissionRequest request) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        String newName = request.getName().trim().toUpperCase().replace(" ", "_");
        if (!permission.getName().equals(newName) && permissionRepository.existsByNameAndIdNot(newName, id)) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        permission.setName(newName);
        permission.setDescription(request.getDescription());

        return toPermissionResponse(permissionRepository.save(permission));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deletePermission(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        permissionRepository.delete(permission);
    }

    // ================= 3. GÁN VAI TRÒ CHO NGƯỜI DÙNG =================
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse assignRolesToUser(Long userId, UserRoleAssignRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Set<Role> roles = new HashSet<>(roleRepository.findAllById(request.getRoleIds()));
        user.setRoles(roles);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    // ================= HELPERS =================
    private RoleResponse toRoleResponse(Role role) {
        List<PermissionResponse> perms = role.getPermissions() != null
                ? role.getPermissions().stream().map(this::toPermissionResponse).collect(Collectors.toList())
                : List.of();

        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .permissions(perms)
                .build();
    }

    private PermissionResponse toPermissionResponse(Permission permission) {
        return PermissionResponse.builder()
                .id(permission.getId())
                .name(permission.getName())
                .description(permission.getDescription())
                .build();
    }
}
