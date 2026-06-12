package com.vlt.ecommerce.feature.shop;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "shops")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Shop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @Column(nullable = false, length = 100)
    String name;
    @Column(columnDefinition = "TEXT")
    String description;
    @Column(name = "logo_url", length = 500)
    String logoUrl;
    @Column(length = 50)
    String address;
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    Boolean isActive = false;
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false, unique = true)
    User seller;
}
