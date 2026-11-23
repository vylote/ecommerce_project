package com.vlt.ecommerce.feature.user.dto.response;

import java.util.Set;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    Long id;
    String email;
    String fullName;
    String phone;
    String avatarUrl;
    Set<RoleResponse> roles;
    Boolean isActive;
}
