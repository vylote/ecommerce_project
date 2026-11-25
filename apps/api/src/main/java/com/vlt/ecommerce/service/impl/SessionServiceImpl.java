package com.vlt.ecommerce.service.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.repository.SessionRepository;
import com.vlt.ecommerce.repository.UserRepository;
import com.vlt.ecommerce.security.CurrentUserProvider;
import com.vlt.ecommerce.service.SessionService;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.integration.redis.SessionAccessStore;
import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.domain.UserSession;
import com.vlt.ecommerce.security.DeviceUtils;
import com.vlt.ecommerce.security.JwtService;
import com.vlt.ecommerce.service.dto.response.TokenResponse;

import jakarta.persistence.EntityManager;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SessionServiceImpl implements SessionService {
    SessionRepository sessionRepository;
    UserRepository userRepository;
    EntityManager entityManager;
    SessionAccessStore sessionAccessStore;
    JwtService jwtService;
    CurrentUserProvider currentUserProvider;

    @Override
    @Transactional
    public TokenResponse createSessionAndGenerateTokens(User user, String userAgent) {
        User current = lockActiveUser(user.getId());
        String sessionId = UUID.randomUUID().toString();
        String deviceInfo = DeviceUtils.parseDeviceInfo(userAgent);

        UserSession userSession = UserSession.builder()
                .id(sessionId)
                .user(current)
                .deviceInfo(deviceInfo)
                .expires_at(LocalDateTime.now().plusHours(24))
                .build();
        sessionRepository.save(userSession);

        return generateTokens(current, sessionId);
    }

    @Override
    @Transactional
    public TokenResponse refreshSession(User user, String sessionId) {
        User current = lockActiveUser(user.getId());
        UserSession session = getSession(sessionId);
        if (!session.getUser().getId().equals(current.getId())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return generateTokens(current, sessionId);
    }

    private User lockActiveUser(Long userId) {
        User user = lockUser(userId);
        entityManager.refresh(user);
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new AppException(ErrorCode.USER_LOCKED);
        }
        return user;
    }

    private User lockUser(Long userId) {
        return userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private TokenResponse generateTokens(User user, String sessionId) {
        String accessToken = jwtService.generateAccessToken(user, sessionId);
        String refreshToken = jwtService.generateRefreshToken(user, sessionId);
        sessionAccessStore.allow(sessionId, user.getId());
        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    @Transactional
    public void revokeOwnSession(String ssid) {
        Long userId = currentUserProvider.getUserId();
        lockUser(userId);
        UserSession session = getSession(ssid);
        if (!session.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        revoke(session);
    }

    @Override
    @Transactional
    public void revokeSession(String ssid) {
        Long userId = sessionRepository.findUserIdBySessionId(ssid)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));
        lockUser(userId);
        sessionRepository.findById(ssid).ifPresent(this::revoke);
    }

    @Override
    @Transactional
    public void revokeUserSessions(Long userId) {
        lockUser(userId);
        sessionRepository.findByUserId(userId).forEach(this::revoke);
    }

    private UserSession getSession(String ssid) {
        return sessionRepository.findById(ssid)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));
    }

    private void revoke(UserSession session) {
        sessionAccessStore.revoke(session.getId());
        sessionRepository.delete(session);
    }
}
