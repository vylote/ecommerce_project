package com.vlt.ecommerce.feature.inventory.dto.request;

import java.util.List;

import com.vlt.ecommerce.feature.inventory.ImportReceiptStatus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class ImportReceiptRequest {
    @NotNull(message = "productId không được để trống")
    Long productId;

    String receiptCode;

    String note;

    @Builder.Default
    ImportReceiptStatus status = ImportReceiptStatus.COMPLETED;

    @NotEmpty(message = "Danh sách chi tiết nhập kho không được để trống")
    @Valid
    List<ImportReceiptDetailRequest> details;
}
