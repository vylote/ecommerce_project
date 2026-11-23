package com.vlt.ecommerce.feature.auth;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.common.security.TokenBlacklistService;
import com.vlt.ecommerce.feature.auth.dto.response.SessionResponse;
import com.vlt.ecommerce.feature.user.UserSession;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SessionService {
    SessionRepository sessionRepository;
    TokenBlacklistService blacklistService;

    @Transactional
    public void revokeSession(String ssid) {
        UserSession session = sessionRepository.findById(ssid)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Long nowMillis = System.currentTimeMillis();
        Long expireMillis = Timestamp.valueOf(session.getExpires_at()).getTime();
        long remainingTtl = expireMillis - nowMillis;

        if (remainingTtl > 0)
            blacklistService.blacklistSsid(ssid, remainingTtl);

        sessionRepository.delete(session);
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getActiveSessions(Long userId, String currentSsid) {
        List<UserSession> sessions = sessionRepository.findByUserId(userId);

        return sessions.stream()
            .map(session -> SessionResponse.builder()
                    .sessionId(session.getId())
                    .deviceInfo(session.getDeviceInfo())
                    .createdAt(session.getCreatedAt())
                    .isCurrentDevice(session.getId().equals(currentSsid)) // So khớp với token đang gửi request
                    .build())
            .toList();
    }
}
