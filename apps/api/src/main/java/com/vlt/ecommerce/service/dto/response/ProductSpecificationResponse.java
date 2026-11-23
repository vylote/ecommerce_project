package com.vlt.ecommerce.service.dto.response;

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
public class ProductSpecificationResponse {
    Long id;
    Long productId;
    Long specificationId;
    String specificationName;
    Long specificationTypeId;
    String specificationTypeName;
    String customValue;
}
