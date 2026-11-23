package com.vlt.ecommerce.feature.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GoogleCompleteRegistrationRequest {
    @NotBlank
    @Email
    String email;

    @NotBlank
    @Size(min = 2, max = 50)
    String fullName;

    @NotBlank
    @Size(min = 9, max = 15)
    String phone;

    @NotBlank
    @Size(min = 6)
    String password;

    String avatarUrl;
}
