-- Seed granular operation authorities and separate VIP buyer roles.
-- Apply after roles, permissions and role_permissions exist.
START TRANSACTION;

INSERT INTO roles (name, description) VALUES
    ('ROLE_ADMIN', 'Marketplace administrator'),
    ('ROLE_BUYER', 'Marketplace buyer'),
    ('ROLE_SELLER', 'Marketplace seller'),
    ('ROLE_BUYER_VIP', 'Legacy VIP buyer'),
    ('ROLE_BUYER_VIP_1', 'VIP tier 1 buyer'),
    ('ROLE_BUYER_VIP_2', 'VIP tier 2 buyer')
ON DUPLICATE KEY UPDATE name = roles.name;

INSERT INTO permissions (name, description) VALUES
    ('ACCOUNT_READ', 'View own account'),
    ('ACCOUNT_UPDATE', 'Update own profile'),
    ('ADDRESS_CREATE', 'Create own address'),
    ('ADDRESS_DELETE', 'Delete own address'),
    ('ADDRESS_READ', 'List own addresses'),
    ('ADDRESS_UPDATE', 'Update own address'),
    ('CART_ADD', 'Add item to own cart'),
    ('CART_CLEAR', 'Clear own cart'),
    ('CART_READ', 'View own cart'),
    ('CART_REMOVE', 'Remove item from own cart'),
    ('CART_UPDATE', 'Update item in own cart'),
    ('CATEGORY_CREATE', 'Create category'),
    ('CATEGORY_DELETE', 'Delete category'),
    ('CATEGORY_IMAGE_UPLOAD', 'Upload category image'),
    ('CATEGORY_UPDATE', 'Edit category'),
    ('COMMISSION_CONFIG_READ', 'Read commission configuration'),
    ('COMMISSION_CONFIG_WRITE', 'Create or edit commission configuration'),
    ('COMMISSION_OWN_STATS_READ', 'Read own shop commission totals'),
    ('COMMISSION_PLATFORM_ANALYTICS_READ', 'Read platform commission analytics'),
    ('COMMISSION_PLATFORM_STATS_READ', 'Read platform commission totals'),
    ('NOTIFICATION_LIST', 'List own notifications'),
    ('NOTIFICATION_MARK_ALL_READ', 'Mark all own notifications as read'),
    ('NOTIFICATION_MARK_READ', 'Mark own notification as read'),
    ('NOTIFICATION_UNREAD_COUNT', 'Count own unread notifications'),
    ('ORDER_BUYER_LIST', 'List own purchases'),
    ('ORDER_CANCEL', 'Cancel own order'),
    ('ORDER_COMPLETE', 'Complete own order'),
    ('ORDER_CONFIRM', 'Confirm own shop order'),
    ('ORDER_CREATE', 'Place an order'),
    ('ORDER_READ_ANY', 'Read any order'),
    ('ORDER_READ_OWN', 'Read own purchase or own shop order'),
    ('ORDER_SHIP', 'Ship own shop order'),
    ('ORDER_SHOP_ANALYTICS_READ', 'Read own shop order analytics'),
    ('ORDER_SHOP_LIST', 'List own shop orders'),
    ('ORDER_SHOP_STATS_READ', 'Read own shop order totals'),
    ('PAYMENT_CONFIRM', 'Confirm mock payment for own order'),
    ('PAYMENT_CREATE', 'Create payment for own order'),
    ('PAYMENT_READ', 'Read payment on own purchase or own shop order'),
    ('PERMISSION_CREATE', 'Create permission'),
    ('PERMISSION_DELETE', 'Delete permission'),
    ('PERMISSION_LIST', 'List permissions'),
    ('PERMISSION_UPDATE', 'Update permission'),
    ('PRODUCT_CREATE', 'Create own shop product'),
    ('PRODUCT_DELETE', 'Delete own shop product'),
    ('PRODUCT_IMAGE_UPLOAD', 'Upload image for own shop product'),
    ('PRODUCT_SHOP_LIST', 'List own shop products'),
    ('PRODUCT_SPECIFICATION_REMOVE', 'Remove specification of own shop product'),
    ('PRODUCT_SPECIFICATION_SET', 'Set specification of own shop product'),
    ('PRODUCT_UPDATE', 'Edit own shop product'),
    ('REVIEW_CREATE', 'Review a product purchased in own order'),
    ('ROLE_ASSIGN', 'Assign roles to a user'),
    ('ROLE_CREATE', 'Create role and configure its permissions'),
    ('ROLE_DELETE', 'Delete role'),
    ('ROLE_LIST', 'List roles'),
    ('ROLE_READ', 'View a role'),
    ('ROLE_UPDATE', 'Update role and configure its permissions'),
    ('SESSION_REVOKE', 'Revoke own session'),
    ('SHOP_ADMIN_LIST', 'List shops for moderation'),
    ('SHOP_ADMIN_STATS_READ', 'Read shop moderation totals'),
    ('SHOP_CREATE', 'Apply for a seller shop'),
    ('SHOP_READ_OWN', 'Read own shop'),
    ('SHOP_STATUS_UPDATE', 'Activate or deactivate shop'),
    ('SHOP_UPDATE', 'Update own shop'),
    ('SPECIFICATION_CREATE', 'Create specification'),
    ('SPECIFICATION_DELETE', 'Delete specification'),
    ('SPECIFICATION_TYPE_CREATE', 'Create specification type'),
    ('SPECIFICATION_TYPE_DELETE', 'Delete specification type'),
    ('SPECIFICATION_TYPE_UPDATE', 'Update specification type'),
    ('SPECIFICATION_UPDATE', 'Update specification'),
    ('STOCK_RECEIPT_CANCEL', 'Cancel own shop stock receipt'),
    ('STOCK_RECEIPT_COMPLETE', 'Complete own shop stock receipt'),
    ('STOCK_RECEIPT_CREATE', 'Create own shop stock receipt'),
    ('STOCK_RECEIPT_LIST', 'List own shop stock receipts'),
    ('STOCK_RECEIPT_READ', 'Read own shop stock receipt'),
    ('STOCK_RECEIPT_READ_ANY', 'Read any shop stock receipt'),
    ('USER_LIST', 'List users'),
    ('USER_READ', 'View a user''s details'),
    ('USER_STATUS_UPDATE', 'Lock or unlock a user'),
    ('VARIANT_CREATE', 'Create variant in own shop'),
    ('VARIANT_DELETE', 'Delete variant in own shop'),
    ('VARIANT_UPDATE', 'Update variant in own shop')
ON DUPLICATE KEY UPDATE name = permissions.name;

-- Signed-in user grants for built-in roles.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles AS r
CROSS JOIN permissions AS p
WHERE r.name IN ('ROLE_ADMIN', 'ROLE_BUYER', 'ROLE_SELLER', 'ROLE_BUYER_VIP', 'ROLE_BUYER_VIP_1', 'ROLE_BUYER_VIP_2')
  AND p.name IN (
      'ACCOUNT_READ',
      'ACCOUNT_UPDATE',
      'NOTIFICATION_LIST',
      'NOTIFICATION_MARK_ALL_READ',
      'NOTIFICATION_MARK_READ',
      'NOTIFICATION_UNREAD_COUNT',
      'SESSION_REVOKE',
      'SHOP_CREATE'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions AS existing
      WHERE existing.role_id = r.id AND existing.permission_id = p.id
  );

-- Admin grants for built-in roles.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles AS r
CROSS JOIN permissions AS p
WHERE r.name IN ('ROLE_ADMIN')
  AND p.name IN (
      'CATEGORY_CREATE',
      'CATEGORY_DELETE',
      'CATEGORY_IMAGE_UPLOAD',
      'CATEGORY_UPDATE',
      'COMMISSION_CONFIG_READ',
      'COMMISSION_CONFIG_WRITE',
      'COMMISSION_PLATFORM_ANALYTICS_READ',
      'COMMISSION_PLATFORM_STATS_READ',
      'ORDER_READ_ANY',
      'PERMISSION_CREATE',
      'PERMISSION_DELETE',
      'PERMISSION_LIST',
      'PERMISSION_UPDATE',
      'ROLE_ASSIGN',
      'ROLE_CREATE',
      'ROLE_DELETE',
      'ROLE_LIST',
      'ROLE_READ',
      'ROLE_UPDATE',
      'SHOP_ADMIN_LIST',
      'SHOP_ADMIN_STATS_READ',
      'SHOP_STATUS_UPDATE',
      'SPECIFICATION_CREATE',
      'SPECIFICATION_DELETE',
      'SPECIFICATION_TYPE_CREATE',
      'SPECIFICATION_TYPE_DELETE',
      'SPECIFICATION_TYPE_UPDATE',
      'SPECIFICATION_UPDATE',
      'STOCK_RECEIPT_READ_ANY',
      'USER_LIST',
      'USER_READ',
      'USER_STATUS_UPDATE'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions AS existing
      WHERE existing.role_id = r.id AND existing.permission_id = p.id
  );

-- Buyer grants for built-in roles.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles AS r
CROSS JOIN permissions AS p
WHERE r.name IN ('ROLE_BUYER', 'ROLE_BUYER_VIP', 'ROLE_BUYER_VIP_1', 'ROLE_BUYER_VIP_2')
  AND p.name IN (
      'ADDRESS_CREATE',
      'ADDRESS_DELETE',
      'ADDRESS_READ',
      'ADDRESS_UPDATE',
      'CART_ADD',
      'CART_CLEAR',
      'CART_READ',
      'CART_REMOVE',
      'CART_UPDATE',
      'ORDER_BUYER_LIST',
      'ORDER_CANCEL',
      'ORDER_COMPLETE',
      'ORDER_CREATE',
      'ORDER_READ_OWN',
      'PAYMENT_CONFIRM',
      'PAYMENT_CREATE',
      'PAYMENT_READ',
      'REVIEW_CREATE'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions AS existing
      WHERE existing.role_id = r.id AND existing.permission_id = p.id
  );

-- Seller grants for built-in roles.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles AS r
CROSS JOIN permissions AS p
WHERE r.name IN ('ROLE_SELLER')
  AND p.name IN (
      'COMMISSION_OWN_STATS_READ',
      'ORDER_CONFIRM',
      'ORDER_READ_OWN',
      'ORDER_SHIP',
      'ORDER_SHOP_ANALYTICS_READ',
      'ORDER_SHOP_LIST',
      'ORDER_SHOP_STATS_READ',
      'PAYMENT_READ',
      'PRODUCT_CREATE',
      'PRODUCT_DELETE',
      'PRODUCT_IMAGE_UPLOAD',
      'PRODUCT_SHOP_LIST',
      'PRODUCT_SPECIFICATION_REMOVE',
      'PRODUCT_SPECIFICATION_SET',
      'PRODUCT_UPDATE',
      'SHOP_READ_OWN',
      'SHOP_UPDATE',
      'SPECIFICATION_CREATE',
      'SPECIFICATION_DELETE',
      'SPECIFICATION_TYPE_CREATE',
      'SPECIFICATION_UPDATE',
      'STOCK_RECEIPT_CANCEL',
      'STOCK_RECEIPT_COMPLETE',
      'STOCK_RECEIPT_CREATE',
      'STOCK_RECEIPT_LIST',
      'STOCK_RECEIPT_READ',
      'VARIANT_CREATE',
      'VARIANT_DELETE',
      'VARIANT_UPDATE'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions AS existing
      WHERE existing.role_id = r.id AND existing.permission_id = p.id
  );

COMMIT;
