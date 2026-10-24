package com.vlt.ecommerce.feature.inventory.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.vlt.ecommerce.feature.inventory.ImportReceiptStatus;

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
public class ImportReceiptResponse {
    Long id;
    String receiptCode;
    Long productId;
    String productName;
    Long shopId;
    String shopName;
    Long userId;
    String userEmail;
    BigDecimal totalCost;
    String note;
    ImportReceiptStatus status;
    LocalDateTime createdAt;
    List<ImportReceiptDetailResponse> details;
}
