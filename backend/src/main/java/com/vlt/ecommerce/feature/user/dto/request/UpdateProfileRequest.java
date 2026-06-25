package com.vlt.ecommerce.feature.user.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateProfileRequest {  
    String fullName;
    String phone;
    String avatarUrl;
}
