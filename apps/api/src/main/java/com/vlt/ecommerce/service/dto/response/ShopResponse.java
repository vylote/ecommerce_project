package com.vlt.ecommerce.service.dto.response;

import java.time.LocalDateTime;
import java.util.Set;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShopResponse {
    Long id;
    String name;
    String description;
    String logoUrl;
    String address;
    Long sellerId;
    String sellerName;
    String sellerEmail;
    String sellerPhone;
    Boolean isActive;
    LocalDateTime createdAt;
    Double rating;
    Long productCount;
    Set<CategoryResponse> categories;
}
