package com.vlt.ecommerce.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.integration.redis.UserAuthorizationCache;
import com.vlt.ecommerce.service.RolePermissionService;
import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.domain.Permission;
import com.vlt.ecommerce.domain.Role;
import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.service.dto.request.PermissionRequest;
import com.vlt.ecommerce.service.dto.request.RoleRequest;
import com.vlt.ecommerce.service.dto.request.UserRoleAssignRequest;
import com.vlt.ecommerce.service.dto.response.PermissionResponse;
import com.vlt.ecommerce.service.dto.response.RoleResponse;
import com.vlt.ecommerce.service.dto.response.UserResponse;
import com.vlt.ecommerce.service.mapper.UserMapper;
import com.vlt.ecommerce.repository.PermissionRepository;
import com.vlt.ecommerce.repository.RoleRepository;
import com.vlt.ecommerce.repository.UserRepository;

import com.vlt.ecommerce.service.mapper.RoleMapper;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RolePermissionServiceImpl implements RolePermissionService {
    RoleRepository roleRepository;
    UserAuthorizationCache authorizationCache;
    PermissionRepository permissionRepository;
    UserRepository userRepository;
    UserMapper userMapper;
    RoleMapper roleMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(roleMapper::toAdminRoleResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        return roleMapper.toAdminRoleResponse(role);
    }

    @Override
    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        String roleName = request.getName().trim().toUpperCase();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        if (roleRepository.findByName(roleName).isPresent()) {
            throw new AppException(ErrorCode.ROLE_NAME_ALREADY_EXISTS);
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

        return roleMapper.toAdminRoleResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    public RoleResponse updateRole(Long id, RoleRequest request) {
        authorizationCache.roleChanged(id);
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        String newRoleName = request.getName().trim().toUpperCase();
        if (!newRoleName.startsWith("ROLE_")) {
            newRoleName = "ROLE_" + newRoleName;
        }

        if (Constants.SYSTEM_ROLES.contains(role.getName()) && !role.getName().equals(newRoleName)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (!role.getName().equals(newRoleName) && roleRepository.findByName(newRoleName).isPresent()) {
            throw new AppException(ErrorCode.ROLE_NAME_ALREADY_EXISTS);
        }

        role.setName(newRoleName);
        role.setDescription(request.getDescription());

        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(request.getPermissionIds()));
            role.setPermissions(permissions);
        }

        return roleMapper.toAdminRoleResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        authorizationCache.roleChanged(id);
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        if (Constants.SYSTEM_ROLES.contains(role.getName())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        roleRepository.delete(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(roleMapper::toPermissionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PermissionResponse createPermission(PermissionRequest request) {
        String permName = request.getName().trim().toUpperCase().replace(" ", "_");

        if (permissionRepository.existsByName(permName)) {
            throw new AppException(ErrorCode.PERMISSION_NAME_ALREADY_EXISTS);
        }

        Permission permission = new Permission(permName, request.getDescription());

        return roleMapper.toPermissionResponse(permissionRepository.save(permission));
    }

    @Override
    @Transactional
    public PermissionResponse updatePermission(Long id, PermissionRequest request) {
        authorizationCache.permissionChanged(id);
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));

        String newName = request.getName().trim().toUpperCase().replace(" ", "_");
        if (!permission.getName().equals(newName) && permissionRepository.existsByNameAndIdNot(newName, id)) {
            throw new AppException(ErrorCode.PERMISSION_NAME_ALREADY_EXISTS);
        }

        permission.setName(newName);
        permission.setDescription(request.getDescription());

        return roleMapper.toPermissionResponse(permissionRepository.save(permission));
    }

    @Override
    @Transactional
    public void deletePermission(Long id) {
        authorizationCache.permissionChanged(id);
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));

        permissionRepository.delete(permission);
    }

    @Override
    @Transactional
    public UserResponse assignRolesToUser(Long userId, UserRoleAssignRequest request) {
        authorizationCache.userChanged(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Set<Role> roles = new HashSet<>(roleRepository.findAllById(request.getRoleIds()));
        user.setRoles(roles);

        return userMapper.toUserResponse(userRepository.save(user));
    }
}
