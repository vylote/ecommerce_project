package com.vlt.ecommerce.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    RESOURCE_EXISTED(1001, "Resource already existed", HttpStatus.CONFLICT),
    RESOURCE_NOT_FOUND(1002, "Resource not found", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1013, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1009, "You don't have permission to do that", HttpStatus.FORBIDDEN),
    INVALID_HIERARCHY(1014, "Cannot set category as its own parent", HttpStatus.BAD_REQUEST);

    int code;
    String message;
    HttpStatusCode statusCode;
}
