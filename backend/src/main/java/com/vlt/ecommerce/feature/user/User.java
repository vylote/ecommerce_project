package com.vlt.ecommerce.feature.user;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "users")
@Data 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String email;
    @Column(nullable = false, unique = true, length = 200)
    String password;
    @Column(name = "full_name", nullable = false, length = 30)
    String fullName;
    @Column(length = 10)
    String phone;
    @Column(name = "avatar_url", length = 500)
    String avatarUrl;
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Role role = Role.BUYER;
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    Boolean isActive = true;
    @Column(name = "create_at", nullable = false, updatable = false)
    @CreationTimestamp
    LocalDateTime createdAt;
    @Column(name = "update_at", nullable = false)
    @UpdateTimestamp
    LocalDateTime updatedAt;
}
