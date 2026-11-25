package com.vlt.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vlt.ecommerce.domain.UserSession;

import jakarta.persistence.LockModeType;

public interface SessionRepository extends JpaRepository<UserSession, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<UserSession> findByUserId(Long userId);

    @Query("SELECT s.user.id FROM UserSession s WHERE s.id = :sessionId")
    Optional<Long> findUserIdBySessionId(@Param("sessionId") String sessionId);
}
