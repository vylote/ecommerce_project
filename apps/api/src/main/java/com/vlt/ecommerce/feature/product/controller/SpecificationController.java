package com.vlt.ecommerce.feature.product.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.feature.product.dto.request.SpecificationRequest;
import com.vlt.ecommerce.feature.product.dto.request.SpecificationTypeRequest;
import com.vlt.ecommerce.feature.product.dto.response.SpecificationResponse;
import com.vlt.ecommerce.feature.product.dto.response.SpecificationTypeResponse;
import com.vlt.ecommerce.feature.product.service.SpecificationService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class SpecificationController {
    SpecificationService specificationService;

    // ================= SPECIFICATION TYPES =================
    @GetMapping("/specification-types")
    public ApiResponse<List<SpecificationTypeResponse>> getAllSpecificationTypes() {
        return ApiResponse.<List<SpecificationTypeResponse>>builder()
                .result(specificationService.getAllSpecificationTypes())
                .build();
    }

    @GetMapping({"/categories/{categoryId}/specification-types", "/specification-types/by-category/{categoryId}"})
    public ApiResponse<List<SpecificationTypeResponse>> getSpecificationTypesByCategory(
            @PathVariable Long categoryId) {
        return ApiResponse.<List<SpecificationTypeResponse>>builder()
                .result(specificationService.getSpecificationTypesByCategory(categoryId))
                .build();
    }

    @GetMapping("/specification-types/{id}")
    public ApiResponse<SpecificationTypeResponse> getSpecificationTypeById(@PathVariable Long id) {
        return ApiResponse.<SpecificationTypeResponse>builder()
                .result(specificationService.getSpecificationTypeById(id))
                .build();
    }

    @PostMapping("/specification-types")
    public ApiResponse<SpecificationTypeResponse> createSpecificationType(
            @RequestBody @Valid SpecificationTypeRequest request) {
        return ApiResponse.<SpecificationTypeResponse>builder()
                .result(specificationService.createSpecificationType(request))
                .build();
    }

    @PutMapping("/specification-types/{id}")
    public ApiResponse<SpecificationTypeResponse> updateSpecificationType(
            @PathVariable Long id,
            @RequestBody @Valid SpecificationTypeRequest request) {
        return ApiResponse.<SpecificationTypeResponse>builder()
                .result(specificationService.updateSpecificationType(id, request))
                .build();
    }

    @DeleteMapping("/specification-types/{id}")
    public ApiResponse<String> deleteSpecificationType(@PathVariable Long id) {
        specificationService.deleteSpecificationType(id);
        return ApiResponse.<String>builder()
                .result("Đã xóa loại đặc tả thành công")
                .build();
    }

    // ================= SPECIFICATIONS =================
    @GetMapping("/specifications")
    public ApiResponse<List<SpecificationResponse>> getSpecifications(
            @RequestParam(name = "typeId") Long typeId) {
        return ApiResponse.<List<SpecificationResponse>>builder()
                .result(specificationService.getSpecificationsByType(typeId))
                .build();
    }

    @PostMapping("/specifications")
    public ApiResponse<SpecificationResponse> createSpecification(
            @RequestBody @Valid SpecificationRequest request) {
        return ApiResponse.<SpecificationResponse>builder()
                .result(specificationService.createSpecification(request))
                .build();
    }

    @PostMapping("/specification-types/{typeId}/specifications")
    public ApiResponse<SpecificationResponse> createSpecificationForType(
            @PathVariable Long typeId,
            @RequestBody @Valid SpecificationRequest request) {
        request.setSpecificationTypeId(typeId);
        return ApiResponse.<SpecificationResponse>builder()
                .result(specificationService.createSpecification(request))
                .build();
    }

    @PutMapping("/specifications/{id}")
    public ApiResponse<SpecificationResponse> updateSpecification(
            @PathVariable Long id,
            @RequestBody @Valid SpecificationRequest request) {
        return ApiResponse.<SpecificationResponse>builder()
                .result(specificationService.updateSpecification(id, request))
                .build();
    }

    @DeleteMapping("/specifications/{id}")
    public ApiResponse<String> deleteSpecification(@PathVariable Long id) {
        specificationService.deleteSpecification(id);
        return ApiResponse.<String>builder()
                .result("Đã xóa giá trị đặc tả thành công")
                .build();
    }
}
