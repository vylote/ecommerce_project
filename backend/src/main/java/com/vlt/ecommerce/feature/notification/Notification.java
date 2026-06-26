package com.vlt.ecommerce.feature.notification;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.vlt.ecommerce.feature.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, length = 50)
    String type; // Ví dụ: "ORDER_CONFIRMED", "ORDER_SHIPPING", "NEW_ORDER"

    @Column(nullable = false, length = 200)
    String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    String message;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    boolean isRead = false;

    @Column(name = "ref_id")
    Long refId; // ID của Order hoặc tài nguyên liên quan để Frontend làm link bấm vào

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    User user;
}
