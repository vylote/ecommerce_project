package com.vlt.ecommerce.feature.user.dto.response;

import com.vlt.ecommerce.feature.user.Role;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String email;
    String password;
    String fullName;
    String phone;
    String avatarUrl;
    Role role;
    Boolean isActive;
}
