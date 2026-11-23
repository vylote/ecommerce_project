package com.vlt.ecommerce.feature.user.mapper;

import java.util.Set;

import org.mapstruct.Mapper;

import com.vlt.ecommerce.feature.user.Role;
import com.vlt.ecommerce.feature.user.dto.response.RoleResponse;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleResponse toRoleResponse(Role role);
    Set<RoleResponse> toRoleResponses(Set<Role> roles);
}
