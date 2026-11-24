package com.vlt.ecommerce.service.dto.request;

import com.vlt.ecommerce.config.Constants;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegisterRequest {
    @NotBlank(message = "{validation.email.required}")
    @Email(message = "{validation.email.invalid}")
    String email;
    @NotBlank(message = "{validation.password.required}")
    @Size(min = 8, message = "{validation.password.minLength}")
    @Pattern(
        regexp = Constants.ACCOUNT_PASSWORD_REGEX,
        message = "{validation.password.pattern}"
    )
    String password;
    @NotBlank(message = "{validation.fullName.required}")
    String fullName;
    @NotBlank(message = "{validation.phone.required}")
    @Pattern(
        regexp = Constants.VIETNAMESE_MOBILE_PHONE_REGEX,
        message = "{validation.phone.invalid}"
    )
    String phone;

    @NotBlank(message = "{validation.otp.required}")
    String otp;
}
