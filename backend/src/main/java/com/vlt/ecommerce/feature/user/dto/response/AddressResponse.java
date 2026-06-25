package com.vlt.ecommerce.feature.user.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class AddressResponse {
    Long userId; // Trả về để Frontend biết của ai
    String fullName;
    String phone;
    String province;
    String district;
    String ward;
    String detail;
    Boolean isDefault;
}
