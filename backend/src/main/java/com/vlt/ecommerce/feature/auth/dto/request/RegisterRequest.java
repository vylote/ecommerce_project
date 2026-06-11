package com.vlt.ecommerce.feature.auth.dto.request;

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
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String email;
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu phải từ 8 ký tự trở lên, tối đa 20 ký tự")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$!%*?&])[A-Za-z\\d@#$!%*?&]+$",
        message = "WEAK_PASSWORD"
    )
    String password;
    @NotBlank(message = "Họ tên không được để trống")
    String fullName;
    @NotBlank(message = "SDT không được để trống")
    @Pattern(
        regexp = "^(0|\\+84)(3|5|7|8|9)[0-9]{8}$",
        message = "Số điện thoại không hợp lệ"
    )
    String phone;
}
