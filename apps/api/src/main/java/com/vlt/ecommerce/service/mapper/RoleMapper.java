package com.vlt.ecommerce.service.mapper;

import java.util.Set;

import org.mapstruct.Mapper;

import com.vlt.ecommerce.domain.Role;
import com.vlt.ecommerce.service.dto.response.RoleResponse;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleResponse toRoleResponse(Role role);
    Set<RoleResponse> toRoleResponses(Set<Role> roles);
}
