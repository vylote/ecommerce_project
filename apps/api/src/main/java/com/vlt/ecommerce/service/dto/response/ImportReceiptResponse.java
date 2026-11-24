package com.vlt.ecommerce.service.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.vlt.ecommerce.domain.enumeration.ImportReceiptStatus;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
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
