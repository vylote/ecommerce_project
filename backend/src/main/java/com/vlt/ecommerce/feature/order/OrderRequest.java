package com.vlt.ecommerce.feature.order;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderRequest {
    @NotNull(message = "vui lòng chọn địa chỉ nhận hàng")
    Long addressId;
    String note;
}
