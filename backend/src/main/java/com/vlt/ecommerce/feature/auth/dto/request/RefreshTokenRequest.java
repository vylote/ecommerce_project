package com.vlt.ecommerce.feature.auth.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RefreshTokenRequest {
    String refreshToken;
}
