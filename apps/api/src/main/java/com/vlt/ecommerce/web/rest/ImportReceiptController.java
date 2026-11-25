package com.vlt.ecommerce.web.rest;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.domain.enumeration.ImportReceiptStatus;
import com.vlt.ecommerce.service.ImportReceiptService;
import com.vlt.ecommerce.service.dto.response.ApiResponse;
import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.service.dto.request.ImportReceiptRequest;
import com.vlt.ecommerce.service.dto.response.ImportReceiptResponse;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/import-receipts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ImportReceiptController {

    ImportReceiptService importReceiptService;

    @PostMapping
    @PreAuthorize("hasAuthority('STOCK_RECEIPT_CREATE')")
    public ApiResponse<ImportReceiptResponse> createReceipt(@RequestBody @Valid ImportReceiptRequest request) {
        return ApiResponse.<ImportReceiptResponse>builder()
                .result(importReceiptService.createReceipt(request))
                .build();
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAuthority('STOCK_RECEIPT_COMPLETE')")
    public ApiResponse<ImportReceiptResponse> completeReceipt(@PathVariable Long id) {
        return ApiResponse.<ImportReceiptResponse>builder()
                .result(importReceiptService.completeReceipt(id))
                .build();
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('STOCK_RECEIPT_CANCEL')")
    public ApiResponse<ImportReceiptResponse> cancelReceipt(@PathVariable Long id) {
        return ApiResponse.<ImportReceiptResponse>builder()
                .result(importReceiptService.cancelReceipt(id))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STOCK_RECEIPT_READ', 'STOCK_RECEIPT_READ_ANY')")
    public ApiResponse<ImportReceiptResponse> getReceiptById(@PathVariable Long id) {
        return ApiResponse.<ImportReceiptResponse>builder()
                .result(importReceiptService.getReceiptById(id))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('STOCK_RECEIPT_LIST')")
    public ApiResponse<PageResponse<ImportReceiptResponse>> getMyReceipts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ImportReceiptStatus status,
            @RequestParam(required = false) Long productId) {

        return ApiResponse.<PageResponse<ImportReceiptResponse>>builder()
                .result(importReceiptService.getMyReceipts(page, size, status, productId))
                .build();
    }
}
