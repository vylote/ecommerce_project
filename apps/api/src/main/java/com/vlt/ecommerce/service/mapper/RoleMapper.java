package com.vlt.ecommerce.service.mapper;

import java.util.List;
import java.util.Set;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.vlt.ecommerce.domain.Permission;
import com.vlt.ecommerce.domain.Role;
import com.vlt.ecommerce.service.dto.response.PermissionResponse;
import com.vlt.ecommerce.service.dto.response.RoleResponse;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "userCount", ignore = true)
    RoleResponse toRoleResponse(Role role);
    Set<RoleResponse> toRoleResponses(Set<Role> roles);

    PermissionResponse toPermissionResponse(Permission permission);

    @Named("adminRoleResponse")
    default RoleResponse toAdminRoleResponse(Role role) {
        RoleResponse response = toRoleResponse(role);
        if (response != null && response.getPermissions() == null) {
            response.setPermissions(List.of());
        }
        return response;
    }
}
