package com.vlt.ecommerce.service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddressRequest {
    @NotBlank(message = "{validation.fullName.required}")
    String fullName;

    @NotBlank(message = "{validation.phone.required}")
    String phone;

    @NotBlank(message = "{validation.address.province.required}")
    String province;

    @NotBlank(message = "{validation.address.district.required}")
    String district;

    @NotBlank(message = "{validation.address.ward.required}")
    String ward;

    @NotBlank(message = "{validation.address.detail.required}")
    String detail;

    Boolean isDefault;
}
