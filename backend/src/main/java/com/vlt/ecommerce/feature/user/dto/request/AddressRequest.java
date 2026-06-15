package com.vlt.ecommerce.feature.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddressRequest {
    @NotBlank(message = "Họ tên không được để trống")
    String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    String phone;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    String province;

    @NotBlank(message = "Quận/Huyện không được để trống")
    String district;

    @NotBlank(message = "Phường/Xã không được để trống")
    String ward;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    String detail;

    Boolean isDefault;
}
