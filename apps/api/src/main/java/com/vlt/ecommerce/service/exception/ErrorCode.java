package com.vlt.ecommerce.service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum ErrorCode {
    // 1000-1999 General and request validation
    RESOURCE_EXISTED(1001, "The resource already exists.", HttpStatus.CONFLICT),
    RESOURCE_NOT_FOUND(1002, "The resource was not found.", HttpStatus.NOT_FOUND),
    UNCATEGORIZED_EXCEPTION(1003, "An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR),
    SYSTEM_ERROR(1004, "The system could not process the request.", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_DATA(1005, "The request contains invalid data.", HttpStatus.BAD_REQUEST),
    REQUEST_PATH_NOT_FOUND(1006, "The requested path or resource was not found.", HttpStatus.NOT_FOUND),
    METHOD_NOT_SUPPORTED(1007, "The HTTP method is not supported for this path.", HttpStatus.METHOD_NOT_ALLOWED),

    // 2000-2999 Authentication and sessions
    UNAUTHENTICATED(2001, "Authentication is required.", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(2002, "You do not have permission to perform this action.", HttpStatus.FORBIDDEN),
    INVALID_OTP(2003, "The verification code is invalid or has expired.", HttpStatus.BAD_REQUEST),
    SESSION_NOT_FOUND(2004, "The login session was not found.", HttpStatus.NOT_FOUND),
    INVALID_CREDENTIALS(2005, "The login identifier or password is incorrect.", HttpStatus.UNAUTHORIZED),
    OTP_EMAIL_SEND_FAILED(2006, "The verification email could not be sent. Please try again later.", HttpStatus.SERVICE_UNAVAILABLE),

    // 3000-3999 Users
    USER_LOCKED(3001, "Your account is locked.", HttpStatus.FORBIDDEN),
    USER_NOT_FOUND(3002, "The user was not found.", HttpStatus.NOT_FOUND),
    PHONE_EXISTED(3003, "This phone number is already associated with an account.", HttpStatus.CONFLICT),
    EMAIL_EXISTED(3004, "This email address is already registered.", HttpStatus.CONFLICT),

    // 4000-4999 Roles and permissions
    ROLE_NOT_FOUND(4001, "The role was not found.", HttpStatus.NOT_FOUND),
    PERMISSION_NOT_FOUND(4002, "The permission was not found.", HttpStatus.NOT_FOUND),
    ROLE_NAME_ALREADY_EXISTS(4003, "A role with this name already exists.", HttpStatus.CONFLICT),
    PERMISSION_NAME_ALREADY_EXISTS(4004, "A permission with this name already exists.", HttpStatus.CONFLICT),
    DEFAULT_ROLE_NOT_CONFIGURED(4005, "The default role has not been configured.", HttpStatus.INTERNAL_SERVER_ERROR),

    // 5000-5999 Shops
    SHOP_NOT_FOUND(5001, "The shop was not found.", HttpStatus.NOT_FOUND),
    SHOP_ALREADY_EXISTS(5002, "You already have a shop.", HttpStatus.CONFLICT),

    // 6000-6999 Categories
    CATEGORY_NOT_FOUND(6001, "The category was not found.", HttpStatus.NOT_FOUND),
    PARENT_CATEGORY_NOT_FOUND(6002, "The parent category was not found.", HttpStatus.NOT_FOUND),
    CATEGORY_SLUG_ALREADY_EXISTS(6003, "A category with this slug already exists.", HttpStatus.CONFLICT),
    INVALID_HIERARCHY(6004, "A category cannot be its own parent.", HttpStatus.BAD_REQUEST),

    // 7000-7999 Products and variants
    PRODUCT_NOT_FOUND(7001, "The product was not found.", HttpStatus.NOT_FOUND),
    VARIANT_NOT_FOUND(7002, "The product variant was not found.", HttpStatus.NOT_FOUND),
    VARIANT_SKU_ALREADY_EXISTS(7003, "A product variant with this SKU already exists.", HttpStatus.CONFLICT),
    VARIANT_PRODUCT_MISMATCH(7004, "The variant does not belong to the selected product.", HttpStatus.BAD_REQUEST),
    PLEASE_SELECT_VARIANT(7005, "Select a product variant.", HttpStatus.BAD_REQUEST),
    PRODUCT_HAS_NO_VARIANTS(7006, "This product has no variants.", HttpStatus.BAD_REQUEST),

    // 8000-8999 Specifications
    SPECIFICATION_NOT_FOUND(8001, "The specification was not found.", HttpStatus.NOT_FOUND),
    SPECIFICATION_TYPE_NOT_FOUND(8002, "The specification type was not found.", HttpStatus.NOT_FOUND),
    SPECIFICATION_TYPE_REQUIRED(8003, "A specification type is required.", HttpStatus.BAD_REQUEST),
    SPECIFICATION_NAME_ALREADY_EXISTS(8004, "A specification with this name already exists in this type.", HttpStatus.CONFLICT),
    SPECIFICATION_TYPE_NAME_ALREADY_EXISTS(8005, "A specification type with this name already exists.", HttpStatus.CONFLICT),

    // 9000-9999 Inventory and stock receipts
    OUT_OF_STOCK(9001, "There is insufficient stock for this product.", HttpStatus.BAD_REQUEST),
    IMPORT_RECEIPT_NOT_FOUND(9002, "The stock receipt was not found.", HttpStatus.NOT_FOUND),
    IMPORT_RECEIPT_CODE_ALREADY_EXISTS(9003, "A stock receipt with this code already exists.", HttpStatus.CONFLICT),

    // 10000-10999 Cart
    CART_ITEM_NOT_FOUND(10001, "One or more cart items were not found.", HttpStatus.NOT_FOUND),

    // 11000-11999 Addresses
    ADDRESS_NOT_FOUND(11001, "The address was not found.", HttpStatus.NOT_FOUND),
    INVALID_ADDRESS(11002, "The shipping address is invalid.", HttpStatus.BAD_REQUEST),

    // 12000-12999 Orders
    ORDER_NOT_FOUND(12001, "The order was not found.", HttpStatus.NOT_FOUND),
    INVALID_ORDER_STATUS(12002, "The order status does not allow this action.", HttpStatus.BAD_REQUEST),
    CANNOT_BUY_OWN_PRODUCT(12003, "You cannot purchase or review your own product.", HttpStatus.BAD_REQUEST),
    TRANSACTION_PROCESSING(12004, "The transaction is already being processed.", HttpStatus.CONFLICT),

    // 13000-13999 Payments
    PAYMENT_NOT_FOUND(13001, "The payment was not found.", HttpStatus.NOT_FOUND),
    PAYMENT_ALREADY_EXISTS(13002, "A payment already exists for this order.", HttpStatus.CONFLICT),
    PAYMENT_ALREADY_PROCESSED(13003, "This payment has already been processed.", HttpStatus.BAD_REQUEST),

    // 14000-14999 Commission
    COMMISSION_NOT_CONFIGURED(14001, "The commission rate has not been configured.", HttpStatus.INTERNAL_SERVER_ERROR),
    COMMISSION_ALREADY_RECORDED(14002, "Commission has already been recorded.", HttpStatus.CONFLICT),

    // 15000-15999 Reviews
    REVIEW_ALREADY_EXISTED(15001, "You have already reviewed this product for this order.", HttpStatus.CONFLICT),
    PRODUCT_NOT_IN_ORDER(15002, "The product does not belong to this order.", HttpStatus.NOT_FOUND),

    // 16000-16999 Notifications
    NOTIFICATION_NOT_FOUND(16001, "The notification was not found.", HttpStatus.NOT_FOUND),

    // 17000-17999 Uploads
    UPLOAD_FILE_REQUIRED(17001, "Select a non-empty file to upload.", HttpStatus.BAD_REQUEST),
    IMAGE_UPLOAD_FAILED(17002, "The image could not be uploaded.", HttpStatus.INTERNAL_SERVER_ERROR);

    final int code;
    final String message;
    final HttpStatusCode statusCode;
}
