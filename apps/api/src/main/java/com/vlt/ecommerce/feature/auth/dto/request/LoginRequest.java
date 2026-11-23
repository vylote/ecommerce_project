package com.vlt.ecommerce.feature.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginRequest {
    @NotBlank(message = "Email hoặc Số điện thoại không được để trống")
    String email;
    @NotBlank(message = "Mật khẩu không được để trống")
    String password;
}
