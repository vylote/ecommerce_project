package com.vlt.ecommerce.feature.product.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpecificationTypeResponse {
    Long id;
    String name;
    String description;
    LocalDateTime createdAt;
    List<SpecificationResponse> specifications;
}
