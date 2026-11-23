package com.vlt.ecommerce.domain;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.vlt.ecommerce.domain.CartItem;
import com.vlt.ecommerce.domain.ImportReceipt;
import com.vlt.ecommerce.domain.Order;
import com.vlt.ecommerce.domain.Review;
import com.vlt.ecommerce.domain.Shop;

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
    @Column(nullable = false, unique = true, length = 100)
    String email;
    @Column(nullable = false)
    String password;
    @Column(name = "full_name", nullable = false, length = 30)
    String fullName;
    @Column(length = 20) 
    String phone;
    @Column(name = "avatar_url", length = 500)
    String avatarUrl;
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    Boolean isActive = true;
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    Set<Role> roles = new HashSet<>();

    @OneToOne(mappedBy = "seller", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    Shop shop;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<Address> addresses;

    @OneToMany(mappedBy = "buyer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<CartItem> cartItems;

    @OneToMany(mappedBy = "buyer", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<Order> orders;

    @OneToMany(mappedBy = "buyer", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<Review> reviews;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<ImportReceipt> importReceipts;
}
