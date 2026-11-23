package com.vlt.ecommerce.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.vlt.ecommerce.domain.UserSession;

public interface SessionRepository extends JpaRepository<UserSession, String> {
    boolean existsById(String sessionId);
    List<UserSession> findByUserId(Long userId);
}