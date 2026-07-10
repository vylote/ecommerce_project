package com.vlt.ecommerce.feature.auth;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.vlt.ecommerce.feature.user.UserSession;

public interface SessionRepository extends JpaRepository<UserSession, String> {
    boolean existsById(String sessionId);
    List<UserSession> findByUserId(Long userId);
}