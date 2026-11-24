package com.vlt.ecommerce.service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginRequest {
    @NotBlank(message = "{validation.login.identifier.required}")
    String email;
    @NotBlank(message = "{validation.password.required}")
    String password;
}
