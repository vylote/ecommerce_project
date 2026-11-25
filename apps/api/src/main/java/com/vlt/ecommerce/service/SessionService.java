package com.vlt.ecommerce.service;

import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.service.dto.response.TokenResponse;

public interface SessionService {

    TokenResponse createSessionAndGenerateTokens(User user, String userAgent);

    TokenResponse refreshSession(User user, String sessionId);

    void revokeOwnSession(String ssid);

    void revokeSession(String ssid);

    void revokeUserSessions(Long userId);
}
