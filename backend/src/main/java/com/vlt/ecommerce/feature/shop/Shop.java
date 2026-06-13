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

// LAZY chính là lười tức là khi SELECT * FROM shops WHERE id = 1; Tuyệt đối không có lệnh JOIN với bảng users/sellers, thay vì 
// tạo ra object thật nó tạo ra một proxy (thay thế) kết hớp với transaction ở shopService, khi có get set seller thì lúc này vì nó
// là proxy k có data, nên khi gọi getSeller thì nó phải nhờ th hibernate truy vấn 1 lần nữa và truy vấn seller id thì cần id, id
// này được bảo quản trong securityContextholder , nếu k có transaction (one done, all nothing) thì sẽ k kéo dài dc session, mà k
// kéo dài dc thì getSeller, k get dc email để so khớp  
