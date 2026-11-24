package com.vlt.ecommerce.web.rest.errors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
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
                ErrorCode errorCode = ErrorCode.REQUEST_PATH_NOT_FOUND;
                return ResponseEntity.status(errorCode.getStatusCode()).body(
                                ApiResponse.builder()
                                                .code(errorCode.getCode())
                                                .message(errorCode.getMessage())
                                                .build());
        }

        @SuppressWarnings("rawtypes")
        @ExceptionHandler(value = HttpRequestMethodNotSupportedException.class)
        ResponseEntity<ApiResponse> handlingMethodNotSupported(HttpRequestMethodNotSupportedException e) {
                ErrorCode errorCode = ErrorCode.METHOD_NOT_SUPPORTED;
                return ResponseEntity.status(errorCode.getStatusCode()).body(
                                ApiResponse.builder()
                                                .code(errorCode.getCode())
                                                .message("HTTP method " + e.getMethod() + " is not supported for this path.")
                                                .build());
        }

        @SuppressWarnings("rawtypes")
        @ExceptionHandler(value = MethodArgumentTypeMismatchException.class)
        ResponseEntity<ApiResponse> handlingMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException e) {
                return ResponseEntity.status(400).body(
                                ApiResponse.builder()
                                                .code(ErrorCode.INVALID_DATA.getCode())
                                                .message("Invalid format for parameter: " + e.getName() + ".")
                                                .build());
        }

        @ExceptionHandler(value = HttpMessageNotReadableException.class)
        ResponseEntity<ApiResponse<Void>> handlingUnreadableRequest(HttpMessageNotReadableException e) {
                ErrorCode errorCode = ErrorCode.INVALID_DATA;
                return ResponseEntity.status(errorCode.getStatusCode()).body(
                                ApiResponse.<Void>builder()
                                                .code(errorCode.getCode())
                                                .message("The request body is missing or malformed.")
                                                .build());
        }

        @SuppressWarnings("rawtypes")
        @ExceptionHandler(value = Exception.class)
        ResponseEntity<ApiResponse> handlingException(Exception e) {
                log.error("Unhandled API exception", e);
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
                ObjectError error = e.getBindingResult().getAllErrors().getFirst();
                String errorMessage = error instanceof FieldError fieldError && fieldError.isBindingFailure()
                        ? "Invalid format for parameter: " + fieldError.getField() + "."
                        : error.getDefaultMessage();

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
                log.warn("Database constraint violation");

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
