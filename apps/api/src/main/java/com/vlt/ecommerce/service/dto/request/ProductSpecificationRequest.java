package com.vlt.ecommerce.service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class ProductSpecificationRequest {
    @NotNull(message = "{validation.specification.id.required}")
    Long specificationId;

    @Size(max = 255, message = "{validation.specification.customValue.maxLength}")
    String customValue;
}
