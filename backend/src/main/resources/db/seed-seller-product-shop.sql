-- ==========================================
-- 1. THÊM TÀI KHOẢN SELLER (USERS)
-- ==========================================
INSERT INTO users (email, password, full_name, phone, avatar_url, is_active, created_at, updated_at) 
VALUES 
('seller_tech@gmail.com', '$2a$10$N/zX2j9K0sO2v/yP.81q7eO.b9l5wX0hZ9xU6WwY3ZqW5q2/5eN22', 'Nguyễn Văn Công Nghệ', '0912345678', NULL, true, NOW(), NOW()),
('seller_fashion@gmail.com', '$2a$10$N/zX2j9K0sO2v/yP.81q7eO.b9l5wX0hZ9xU6WwY3ZqW5q2/5eN22', 'Trần Thị Thời Trang', '0987654321', NULL, true, NOW(), NOW());

-- ==========================================
-- 2. THÊM SHOP (Cửa hàng)
-- ==========================================
INSERT INTO shops (name, description, logo_url, address, is_active, created_at, rating, seller_id) 
VALUES 
('Tech Store VN', 'Chuyên bán đồ điện tử chính hãng', 'logo-tech.png', 'Hà Nội', true, NOW(), 4.8, (SELECT id FROM users WHERE email = 'seller_tech@gmail.com')),
('Fashion Boutique', 'Thời trang nam nữ cao cấp', 'logo-fashion.png', 'TP.HCM', true, NOW(), 4.9, (SELECT id FROM users WHERE email = 'seller_fashion@gmail.com'));

-- ==========================================
-- 3. THÊM SẢN PHẨM (PRODUCTS)
-- ==========================================
-- Giả sử ID Danh mục đang khớp với script Categories hồi nãy:
-- (5: Computer Accessories, 6: Consumer Electronics, 15: Men Clothes, 26: Women Clothes)
INSERT INTO products (name, description, price, stock_quantity, sold_count, status, created_at, updated_at, average_rating, review_count, shop_id, category_id, version) 
VALUES 
-- Sản phẩm Shop 1 (Công nghệ)
('Tai nghe Bluetooth Sony WH-1000XM4', 'Tai nghe chống ồn chủ động tốt nhất hiện nay, pin 30h.', 3500000.00, 100, 25, 'ACTIVE', NOW(), NOW(), 4.5, 10, (SELECT id FROM shops WHERE name = 'Tech Store VN'), 6, 0),
('Bàn phím cơ Keychron K2', 'Bàn phím cơ không dây layout 75%, Led RGB.', 2100000.00, 50, 12, 'ACTIVE', NOW(), NOW(), 4.8, 5, (SELECT id FROM shops WHERE name = 'Tech Store VN'), 5, 0),

-- Sản phẩm Shop 2 (Thời trang)
('Áo thun nam Polo Cotton 100%', 'Áo thun thoáng mát thấm hút mồ hôi, co giãn 4 chiều.', 150000.00, 200, 150, 'ACTIVE', NOW(), NOW(), 4.9, 30, (SELECT id FROM shops WHERE name = 'Fashion Boutique'), 15, 0),
('Váy hoa nhí trễ vai mùa hè', 'Váy thiết kế dáng suông, chất voan tơ mềm mại.', 250000.00, 80, 45, 'ACTIVE', NOW(), NOW(), 4.7, 12, (SELECT id FROM shops WHERE name = 'Fashion Boutique'), 26, 0);

-- ==========================================
-- 4. THÊM ẢNH CHO SẢN PHẨM (PRODUCT_IMAGES)
-- ==========================================
INSERT INTO product_images (url, is_primary, sort_order, product_id) 
VALUES 
('https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80', true, 1, (SELECT id FROM products WHERE name = 'Tai nghe Bluetooth Sony WH-1000XM4')),
('https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80', true, 1, (SELECT id FROM products WHERE name = 'Bàn phím cơ Keychron K2')),
('https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80', true, 1, (SELECT id FROM products WHERE name = 'Áo thun nam Polo Cotton 100%')),
('https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80', true, 1, (SELECT id FROM products WHERE name = 'Váy hoa nhí trễ vai mùa hè'));
