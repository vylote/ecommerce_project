package com.vlt.ecommerce.feature.user;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vlt.ecommerce.feature.auth.dto.request.RegisterRequest;
import com.vlt.ecommerce.feature.user.dto.response.UserResponse;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true) 
    @Mapping(target = "updatedAt", ignore = true)
    User toUser(RegisterRequest request);
    UserResponse toUserResponse(User user);
}
