package com.vlt.ecommerce.service.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    @NotNull(message = "{validation.order.shippingAddress.required}")
    Long addressId;
    String note;
    String idempotencyKey;
    @NotEmpty(message = "{validation.order.items.required}")
    List<Long> cartItemIds;
}
