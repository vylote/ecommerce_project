package com.vlt.ecommerce.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum ErrorCode {
    RESOURCE_EXISTED(1001, "Resource already existed", HttpStatus.CONFLICT),
    RESOURCE_NOT_FOUND(1002, "Resource not found", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1013, "Unauthenticated", HttpStatus.UNAUTHORIZED);

    int code;
    String message;
    HttpStatusCode statusCode;
}
