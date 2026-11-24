package com.vlt.ecommerce.service.impl;

import java.sql.Timestamp;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.repository.SessionRepository;
import com.vlt.ecommerce.service.SessionService;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.integration.redis.TokenBlacklistService;
import com.vlt.ecommerce.domain.UserSession;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SessionServiceImpl implements SessionService {
    SessionRepository sessionRepository;
    TokenBlacklistService blacklistService;

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
