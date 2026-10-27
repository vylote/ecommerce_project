package com.vlt.ecommerce.feature.auth.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GoogleAuthResponse {
    Boolean isNewUser;
    String email;
    String fullName;
    String avatarUrl;
    TokenResponse tokenResponse;
}
