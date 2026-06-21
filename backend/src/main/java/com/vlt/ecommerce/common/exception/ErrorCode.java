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
    INVALID_HIERARCHY(1014, "Cannot set category as its own parent", HttpStatus.BAD_REQUEST),

    INVALID_ADDRESS(1015, "Địa chỉ giao hàng không hợp lệ", HttpStatus.BAD_REQUEST),
    SYSTEM_ERROR(1016, "Lỗi hệ thống khi xử lý dữ liệu", HttpStatus.INTERNAL_SERVER_ERROR),
    OUT_OF_STOCK(1017, "Sản phẩm không đủ số lượng trong kho", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_STATUS(1018, "Trạng thái đơn hàng không hợp lệ cho thao tác này", HttpStatus.BAD_REQUEST);

    int code;
    String message;
    HttpStatusCode statusCode;
}
