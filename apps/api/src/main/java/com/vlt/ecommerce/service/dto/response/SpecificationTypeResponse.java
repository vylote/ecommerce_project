package com.vlt.ecommerce.service.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpecificationTypeResponse {
    Long id;
    String name;
    String description;
    Boolean isVariant;
    LocalDateTime createdAt;
    List<SpecificationResponse> specifications;
    List<Long> categoryIds;
    List<String> categoryNames;
}
