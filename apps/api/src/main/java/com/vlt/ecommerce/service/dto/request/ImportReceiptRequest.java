package com.vlt.ecommerce.service.dto.request;

import java.util.List;

import com.vlt.ecommerce.domain.enumeration.ImportReceiptStatus;

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
    @NotNull(message = "{validation.product.id.required}")
    Long productId;

    String receiptCode;

    String note;

    @Builder.Default
    ImportReceiptStatus status = ImportReceiptStatus.COMPLETED;

    @NotEmpty(message = "{validation.receipt.details.required}")
    @Valid
    List<ImportReceiptDetailRequest> details;
}
