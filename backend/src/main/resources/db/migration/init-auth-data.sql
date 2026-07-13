INSERT INTO permissions (name, description) VALUES 
('VIEW_PRODUCT', 'Xem sản phẩm'),
('ADD_TO_CART', 'Thêm vào giỏ hàng'),
('PLACE_ORDER', 'Đặt hàng'),
('WRITE_REVIEW', 'Đánh giá sản phẩm'),
('VIP_FREE_SHIPPING', 'Miễn phí vận chuyển VIP'),
('VIP_EXCLUSIVE_VOUCHER', 'Nhận ưu đãi giảm giá VIP'),
('ACCESS_SELLER_PORTAL', 'Truy cập kênh người bán'),
('CREATE_PRODUCT', 'Đăng sản phẩm mới'),
('UPDATE_PRODUCT', 'Cập nhật sản phẩm'),
('MANAGE_SHOP_ORDER', 'Quản lý đơn hàng của shop'),
('CONFIGURE_COMMISSION', 'Cấu hình hoa hồng hệ thống'),
('MANAGE_USER_STATUS', 'Quản lý trạng thái người dùng');

INSERT INTO roles (name, description) VALUES 
('ROLE_BUYER', 'Khách mua hàng cơ bản'),
('ROLE_BUYER_VIP', 'Khách mua nhiều (Loyal)'),
('ROLE_SELLER', 'Chủ shop kinh doanh'),
('ROLE_ADMIN', 'Quản trị viên sàn');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ROLE_BUYER' 
AND p.name IN ('VIEW_PRODUCT', 'ADD_TO_CART', 'PLACE_ORDER', 'WRITE_REVIEW');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ROLE_BUYER_VIP' 
AND p.name IN (
    'VIEW_PRODUCT', 'ADD_TO_CART', 'PLACE_ORDER', 'WRITE_REVIEW', 
    'VIP_FREE_SHIPPING', 'VIP_EXCLUSIVE_VOUCHER'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ROLE_SELLER' 
AND p.name IN (
    'VIEW_PRODUCT', 'ADD_TO_CART', 'PLACE_ORDER', 'WRITE_REVIEW', 
    'ACCESS_SELLER_PORTAL', 'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'MANAGE_SHOP_ORDER'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ROLE_ADMIN';

INSERT INTO users (email, password, full_name, is_active, created_at, updated_at) 
VALUES (
    'admin@gmail.com', 
    '$2a$10$3st8wmNGFdm9JBXFJnOkc.gPjet4qQwALDzSN6nO98vzINBrb2o2S', 
    'Super Administrator', 
    true, 
    NOW(), 
    NOW()
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@gmail.com' AND r.name = 'ROLE_ADMIN';