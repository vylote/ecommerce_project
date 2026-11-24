package com.vlt.ecommerce.service.impl;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.repository.SessionRepository;
import com.vlt.ecommerce.service.SessionService;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.integration.redis.TokenBlacklistService;
import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.domain.UserSession;
import com.vlt.ecommerce.security.DeviceUtils;
import com.vlt.ecommerce.security.JwtService;
import com.vlt.ecommerce.service.dto.response.TokenResponse;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SessionServiceImpl implements SessionService {
    SessionRepository sessionRepository;
    TokenBlacklistService blacklistService;
    JwtService jwtService;

    @Override
    public TokenResponse createSessionAndGenerateTokens(User user, String userAgent) {
        String sessionId = UUID.randomUUID().toString();
        String deviceInfo = DeviceUtils.parseDeviceInfo(userAgent);

        UserSession userSession = UserSession.builder()
                .id(sessionId)
                .user(user)
                .deviceInfo(deviceInfo)
                .expires_at(LocalDateTime.now().plusHours(24))
                .build();
        sessionRepository.save(userSession);

        return generateTokens(user, sessionId);
    }

    @Override
    public TokenResponse generateTokens(User user, String sessionId) {
        String accessToken = jwtService.generateAccessToken(user, sessionId);
        String refreshToken = jwtService.generateRefreshToken(user, sessionId);
        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    @Transactional
    public void revokeSession(String ssid) {
        UserSession session = sessionRepository.findById(ssid)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));

        Long nowMillis = System.currentTimeMillis();
        Long expireMillis = Timestamp.valueOf(session.getExpires_at()).getTime();
        long remainingTtl = expireMillis - nowMillis;

        if (remainingTtl > 0)
            blacklistService.blacklistSsid(ssid, remainingTtl);

        sessionRepository.delete(session);
    }
}
