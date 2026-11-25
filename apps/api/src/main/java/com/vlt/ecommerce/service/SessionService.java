package com.vlt.ecommerce.service;

import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.service.dto.response.TokenResponse;

public interface SessionService {

    TokenResponse createSessionAndGenerateTokens(User user, String userAgent);

    TokenResponse generateTokens(User user, String sessionId);

    void revokeOwnSession(String ssid);

    void revokeSession(String ssid);
}
