package com.vlt.ecommerce.service.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GoogleAuthResponse {
    private Boolean isNewUser;
    private String email;
    private String fullName;
    private String avatarUrl;
    private TokenResponse tokenResponse;
}
