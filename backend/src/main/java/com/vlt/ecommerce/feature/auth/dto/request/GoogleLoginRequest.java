package com.vlt.ecommerce.feature.auth.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GoogleLoginRequest {
    String idToken;
    String accessToken;

    public String getToken() {
        if (accessToken != null && !accessToken.isBlank()) {
            return accessToken;
        }
        return idToken;
    }
}
