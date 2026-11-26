SET @zalopay_payment_ddl = CONCAT(
    'ALTER TABLE payments MODIFY COLUMN method ENUM(''BANK_TRANSFER'', ''COD'', ''MOCK_ONLINE'', ''ZALOPAY'') NOT NULL',
    IF(EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'gateway_order_id'
    ), '', ', ADD COLUMN gateway_order_id VARCHAR(100) NULL'),
    IF(EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'gateway_pay_url'
    ), '', ', ADD COLUMN gateway_pay_url VARCHAR(2048) NULL'),
    IF(EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND NON_UNIQUE = 0
        GROUP BY INDEX_NAME
        HAVING COUNT(*) = 1 AND MAX(COLUMN_NAME) = 'gateway_order_id'
    ), '', ', ADD CONSTRAINT uk_payments_gateway_order_id UNIQUE (gateway_order_id)')
);

PREPARE zalopay_payment_statement FROM @zalopay_payment_ddl;
EXECUTE zalopay_payment_statement;
DEALLOCATE PREPARE zalopay_payment_statement;
SET @zalopay_payment_ddl = NULL;
