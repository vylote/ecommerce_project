package com.vlt.ecommerce.service.mapper;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.service.dto.request.GoogleCompleteRegistrationRequest;
import com.vlt.ecommerce.service.dto.request.RegisterRequest;
import com.vlt.ecommerce.service.dto.request.UpdateProfileRequest;
import com.vlt.ecommerce.service.dto.response.UserResponse;

@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public interface UserMapper {
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "email", source = "email")
    @Mapping(target = "fullName", source = "fullName", qualifiedByName = "trimRegistrationField")
    @Mapping(target = "phone", source = "phone", qualifiedByName = "trimRegistrationField")
    User toUser(RegisterRequest request);

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "email", source = "email")
    @Mapping(target = "fullName", source = "fullName", qualifiedByName = "trimRegistrationField")
    @Mapping(target = "phone", source = "phone", qualifiedByName = "trimRegistrationField")
    @Mapping(target = "avatarUrl", source = "avatarUrl")
    User toUser(GoogleCompleteRegistrationRequest request);

    @Named("trimRegistrationField")
    default String trimRegistrationField(String value) {
        return value == null ? null : value.trim();
    }

    UserResponse toUserResponse(User user);

    List<UserResponse> toUserResponses(List<User> users);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true) 
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "addresses", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "cartItems", ignore = true)
    @Mapping(target = "orders", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "importReceipts", ignore = true)
    void updateUserProfile(UpdateProfileRequest request, @MappingTarget User user);
}
