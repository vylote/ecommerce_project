package com.vlt.ecommerce.service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpecificationResponse {
    Long id;
    String name;
    String description;
    Long specificationTypeId;
    String specificationTypeName;
}
