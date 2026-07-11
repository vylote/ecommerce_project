package com.vlt.ecommerce.feature.order;

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
    @NotNull(message = "vui lòng chọn địa chỉ nhận hàng")
    Long addressId;
    String note;
    // [BỔ SUNG TRƯỜNG NÀY] Frontend phải tự sinh ra mã này (Dùng thư viện uuid)
    String idempotencyKey;
    // Danh sách các ID của bản ghi cart_items được chọn để thanh toán
    @NotEmpty(message = "Vui lòng chọn ít nhất một sản phẩm để đặt hàng")
    List<Long> cartItemIds;
}
