package com.vlt.ecommerce.service;

import com.vlt.ecommerce.domain.enumeration.ImportReceiptStatus;
import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.service.dto.request.ImportReceiptRequest;
import com.vlt.ecommerce.service.dto.response.ImportReceiptResponse;

public interface ImportReceiptService {

    ImportReceiptResponse createReceipt(ImportReceiptRequest request);

    ImportReceiptResponse completeReceipt(Long id);

    ImportReceiptResponse cancelReceipt(Long id);

    ImportReceiptResponse getReceiptById(Long id);

    PageResponse<ImportReceiptResponse> getMyReceipts(int page, int size, ImportReceiptStatus status, Long productId);
}
