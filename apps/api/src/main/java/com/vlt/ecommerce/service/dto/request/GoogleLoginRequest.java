package com.vlt.ecommerce.service.dto.request;

import org.springframework.util.StringUtils;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GoogleLoginRequest {
    String idToken;
    String accessToken;

    public String getToken() {
        if (StringUtils.hasText(accessToken)) {
            return accessToken;
        }
        return idToken;
    }
}
