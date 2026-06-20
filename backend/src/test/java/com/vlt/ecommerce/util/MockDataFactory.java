package com.vlt.ecommerce.util;

import java.util.UUID;

import com.vlt.ecommerce.feature.product.Category;
import com.vlt.ecommerce.feature.shop.Shop;
import com.vlt.ecommerce.feature.user.Role;
import com.vlt.ecommerce.feature.user.User;

public class MockDataFactory {
    public static User createValidSeller() {
        String randomString = UUID.randomUUID().toString().substring(0, 8);
        
        return User.builder()
                .email("seller_" + randomString + "@gmail.com")
                .password("hashed_password_123")
                .fullName("Seller " + randomString)
                .phone("09" + (int)(Math.random() * 100000000))
                .role(Role.SELLER)
                .isActive(true)
                .build();
    }

    public static User createValidBuyer() {
        String randomString = UUID.randomUUID().toString().substring(0, 8);
        
        return User.builder()
                .email("buyer_" + randomString + "@gmail.com")
                .password("hashed_password_123")
                .fullName("Buyer " + randomString)
                .role(Role.BUYER)
                .isActive(true)
                .build();
    }

    public static Category createValidCategory() {
        String randomString = UUID.randomUUID().toString().substring(0, 8);
        
        return Category.builder()
                .name("Category " + randomString)
                .slug("slug-" + randomString)
                .isActive(true)
                .build();
    }

    public static Category createValidCategory(Category parent) {
        Category child = createValidCategory(); // Gọi lại hàm trên để lấy name, slug, image mặc định
        child.setParent(parent); // Gắn cha cho nó
        return child;
    }

    public static Shop createValidShop(User seller) {
        String randomString = UUID.randomUUID().toString().substring(0, 8);
        
        return Shop.builder()
                .name("Shop " + randomString)
                .seller(seller)
                .isActive(true)
                .build();
    }
}
