package com.vlt.ecommerce.service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
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
