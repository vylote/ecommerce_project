package com.vlt.ecommerce.common.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.vlt.ecommerce.common.dto.ApiResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {
    @SuppressWarnings("rawtypes")
    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handlingAppException(AppException e) {
        ErrorCode errorCode = e.getErrorCode();

        return ResponseEntity.status(errorCode.getStatusCode()).body(
                ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @SuppressWarnings("rawtypes")
    @ExceptionHandler(value = NoResourceFoundException.class)
    ResponseEntity<ApiResponse> handlingNotFoundException(NoResourceFoundException e) {
        // Không cần in log đỏ lòm cho lỗi thiếu ảnh tĩnh nữa
        return ResponseEntity.status(404).body(
                ApiResponse.builder()
                        .code(404)
                        .message("Không tìm thấy đường dẫn hoặc tài nguyên (404)")
                        .build());
    }

    @SuppressWarnings("rawtypes")
    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse> handlingRuntimeException(RuntimeException e) {
        log.error("BẮT ĐƯỢC THỦ PHẠM GÂY LỖI 9999: ", e);
        ErrorCode errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;

        return ResponseEntity.status(errorCode.getStatusCode()).body(
                ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @SuppressWarnings("rawtypes")
    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse> handlingAccessDeniedException(AccessDeniedException e) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        return ResponseEntity.status(errorCode.getStatusCode()).body(
                ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @SuppressWarnings("rawtypes")
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse> handlingValidationException(MethodArgumentNotValidException e) {
        // Lấy câu thông báo lỗi đầu tiên từ DTO (VD: "Email không đúng định dạng")
        String errorMessage = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();

        // Sử dụng mã lỗi chung cho Validation (Bạn có thể thêm INVALID_DATA vào ErrorCode nếu chưa có)
        ErrorCode errorCode = ErrorCode.INVALID_DATA; 

        return ResponseEntity.status(errorCode.getStatusCode()).body(
                ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorMessage) // Ghi đè message mặc định bằng message cụ thể của field
                        .build());
    }

    @SuppressWarnings("rawtypes")
    @ExceptionHandler(value = DataIntegrityViolationException.class)
    ResponseEntity<ApiResponse> handlingDataIntegrityViolationException(DataIntegrityViolationException e) {
        log.warn("Lỗi trùng lặp dữ liệu (Nghi ngờ Double Submit): {}", e.getMessage());
        
        // Bạn có thể tạo thêm ErrorCode.TRANSACTION_PROCESSING, hoặc trả về cấu trúc tĩnh như sau:
        return ResponseEntity.status(409).body(
                ApiResponse.builder()
                        .code(409)
                        .message("Giao dịch đang được xử lý, vui lòng không nhấn nút thanh toán nhiều lần!")
                        .build());
    }
}
