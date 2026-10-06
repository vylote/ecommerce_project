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
                String errorMessage = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();

                ErrorCode errorCode = ErrorCode.INVALID_DATA;

                return ResponseEntity.status(errorCode.getStatusCode()).body(
                                ApiResponse.builder()
                                                .code(errorCode.getCode())
                                                .message(errorMessage)
                                                .build());
        }

        @SuppressWarnings("rawtypes")
        @ExceptionHandler(value = DataIntegrityViolationException.class)
        ResponseEntity<ApiResponse> handlingDataIntegrityViolationException(DataIntegrityViolationException e) {
                log.warn("Lỗi trùng lặp dữ liệu (Nghi ngờ Double Submit): {}", e.getMessage());

                ErrorCode errorCode = ErrorCode.TRANSACTION_PROCESSING;
                if (e.getMessage() != null && e.getMessage().contains("uq_review")) {
                        errorCode = ErrorCode.REVIEW_ALREADY_EXISTED;
                }

                return ResponseEntity.status(errorCode.getStatusCode()).body(
                                ApiResponse.builder()
                                                .code(errorCode.getCode())
                                                .message(errorCode.getMessage())
                                                .build());
        }
}
