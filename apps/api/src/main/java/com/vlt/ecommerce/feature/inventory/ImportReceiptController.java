package com.vlt.ecommerce.feature.inventory;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.common.dto.PageResponse;
import com.vlt.ecommerce.feature.inventory.dto.request.ImportReceiptRequest;
import com.vlt.ecommerce.feature.inventory.dto.response.ImportReceiptResponse;

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
    public ApiResponse<ImportReceiptResponse> createReceipt(@RequestBody @Valid ImportReceiptRequest request) {
        return ApiResponse.<ImportReceiptResponse>builder()
                .result(importReceiptService.createReceipt(request))
                .build();
    }

    @RequestMapping(value = "/{id}/complete", method = { RequestMethod.PATCH, RequestMethod.POST })
    public ApiResponse<ImportReceiptResponse> completeReceipt(@PathVariable Long id) {
        return ApiResponse.<ImportReceiptResponse>builder()
                .result(importReceiptService.completeReceipt(id))
                .build();
    }

    @RequestMapping(value = "/{id}/cancel", method = { RequestMethod.PATCH, RequestMethod.POST })
    public ApiResponse<ImportReceiptResponse> cancelReceipt(@PathVariable Long id) {
        return ApiResponse.<ImportReceiptResponse>builder()
                .result(importReceiptService.cancelReceipt(id))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ImportReceiptResponse> getReceiptById(@PathVariable Long id) {
        return ApiResponse.<ImportReceiptResponse>builder()
                .result(importReceiptService.getReceiptById(id))
                .build();
    }

    @GetMapping
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
