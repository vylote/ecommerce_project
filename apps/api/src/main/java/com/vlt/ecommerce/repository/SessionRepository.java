package com.vlt.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.vlt.ecommerce.domain.UserSession;

public interface SessionRepository extends JpaRepository<UserSession, String> {
    boolean existsById(String sessionId);
}