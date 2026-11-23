package com.vlt.ecommerce.web.rest.errors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.service.dto.response.ApiResponse;

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
        @ExceptionHandler(value = HttpRequestMethodNotSupportedException.class)
        ResponseEntity<ApiResponse> handlingMethodNotSupported(HttpRequestMethodNotSupportedException e) {
                return ResponseEntity.status(405).body(
                                ApiResponse.builder()
                                                .code(405)
                                                .message("Phương thức HTTP " + e.getMethod() + " không được hỗ trợ cho đường dẫn này")
                                                .build());
        }

        @SuppressWarnings("rawtypes")
        @ExceptionHandler(value = MethodArgumentTypeMismatchException.class)
        ResponseEntity<ApiResponse> handlingMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException e) {
                return ResponseEntity.status(400).body(
                                ApiResponse.builder()
                                                .code(1021)
                                                .message("Tham số '" + e.getName() + "' không hợp lệ: '" + e.getValue() + "' sai định dạng!")
                                                .build());
        }

        @SuppressWarnings("rawtypes")
        @ExceptionHandler(value = Exception.class)
        ResponseEntity<ApiResponse> handlingException(Exception e) {
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
                String errorMessage = e.getBindingResult().getAllErrors().getFirst().getDefaultMessage();

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
                String message = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
                log.warn("Lỗi vi phạm toàn vẹn dữ liệu: {}", message);

                ErrorCode errorCode;
                if (message.contains("idempotency")) {
                        errorCode = ErrorCode.TRANSACTION_PROCESSING;
                } else if (message.contains("uq_review")) {
                        errorCode = ErrorCode.REVIEW_ALREADY_EXISTED;
                } else if (message.contains("commission_records") || message.contains("order_item_id")) {
                        errorCode = ErrorCode.COMMISSION_ALREADY_RECORDED;
                } else if (message.contains("foreign key") || message.contains("fk_")) {
                        errorCode = ErrorCode.INVALID_DATA;
                } else {
                        errorCode = ErrorCode.RESOURCE_EXISTED;
                }

                return ResponseEntity.status(errorCode.getStatusCode()).body(
                                ApiResponse.builder()
                                                .code(errorCode.getCode())
                                                .message(errorCode.getMessage())
                                                .build());
        }
}
