-- Script nạp tự động toàn bộ 44 loại đặc tả và các giá trị chuẩn từ file1
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE category_specification_types;
TRUNCATE TABLE specifications;
TRUNCATE TABLE specification_types;

-- ================= Màu sắc (ID: 1) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (1, 'Màu sắc', 'Màu sắc chủ đạo của sản phẩm, áp dụng cho toàn sàn', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (1, 'Đen', 'Black', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (2, 'Trắng', 'White', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (3, 'Trắng ngà', 'Ivory', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (4, 'Xám', 'Grey', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (5, 'Xám đậm', 'Charcoal', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (6, 'Bạc', 'Silver', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (7, 'Đỏ', 'Red', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (8, 'Đỏ đô', 'Burgundy', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (9, 'Hồng', 'Pink', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (10, 'Hồng phấn', 'Blush Pink', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (11, 'Cam', 'Orange', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (12, 'Vàng', 'Yellow', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (13, 'Vàng kem', 'Cream Yellow', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (14, 'Be', 'Beige', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (15, 'Nâu', 'Brown', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (16, 'Nâu đất', 'Khaki Brown', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (17, 'Xanh dương', 'Blue', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (18, 'Xanh navy', 'Navy Blue', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (19, 'Xanh da trời', 'Sky Blue', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (20, 'Xanh lá', 'Green', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (21, 'Xanh rêu', 'Olive Green', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (22, 'Xanh ngọc', 'Teal', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (23, 'Tím', 'Purple', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (24, 'Tím than', 'Dark Purple', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (25, 'Kem', 'Cream', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (26, 'Vàng đồng', 'Gold', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (27, 'Đa màu', 'Multicolor', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (28, 'Trong suốt', 'Transparent', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Họa tiết (ID: 2) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (2, 'Họa tiết', 'Họa tiết hoặc kiểu dáng bề mặt chính của sản phẩm', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (29, 'Trơn', 'Solid / Plain', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (30, 'Sọc', 'Striped', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (31, 'Kẻ caro', 'Plaid', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (32, 'Hoa', 'Floral', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (33, 'Chấm bi', 'Polka Dot', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (34, 'Hình học', 'Geometric', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (35, 'Con vật', 'Animal Print', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (36, 'Hoạt hình', 'Cartoon', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (37, 'Chữ / Logo', 'Letter / Logo', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (38, 'Cẩm thạch', 'Tie-dye / Marble', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (39, 'Ren', 'Lace', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (40, 'Thêu', 'Embroidered', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (41, 'In 3D', '3D Print', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (42, 'Khác', 'Other', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Chất liệu (ID: 3) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (3, 'Chất liệu', 'Chất liệu chính cấu tạo nên sản phẩm', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (43, 'Cotton', 'Cotton', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (44, 'Polyester', 'Polyester', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (45, 'Spandex', 'Spandex', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (46, 'Lụa', 'Silk', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (47, 'Linen', 'Linen', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (48, 'Da thật', 'Genuine Leather', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (49, 'Da PU', 'PU Leather', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (50, 'Nhựa', 'Plastic', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (51, 'Nhựa ABS', 'ABS Plastic', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (52, 'Silicone', 'Silicone', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (53, 'Cao su', 'Rubber', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (54, 'Kim loại', 'Metal', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (55, 'Thép không gỉ', 'Stainless Steel', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (56, 'Nhôm', 'Aluminum', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (57, 'Gỗ', 'Wood', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (58, 'Gốm sứ', 'Ceramic', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (59, 'Thủy tinh', 'Glass', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (60, 'Giấy', 'Paper', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (61, 'Vải không dệt', 'Non-woven Fabric', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (62, 'Khác', 'Other', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Kích cỡ quần áo (ID: 4) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (4, 'Kích cỡ quần áo', 'Kích cỡ chuẩn cho quần áo người lớn và trẻ em', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (4, 15);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (4, 26);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (4, 13);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (4, 20);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (4, 7);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (63, 'XXS', '2X Small', 4) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (64, 'XS', 'Extra Small', 4) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (65, 'S', 'Small', 4) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (66, 'M', 'Medium', 4) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (67, 'L', 'Large', 4) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (68, 'XL', 'Extra Large', 4) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (69, 'XXL', '2X Large', 4) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (70, '3XL', '3X Large', 4) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (71, '4XL', '4X Large', 4) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (72, '5XL', '5X Large', 4) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (73, 'Freesize', 'Kích cỡ tự do', 4) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Kích cỡ quần áo trẻ em (ID: 5) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (5, 'Kích cỡ quần áo trẻ em', 'Kích cỡ theo độ tuổi hoặc chiều cao cho trẻ em', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (5, 13);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (5, 18);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (74, '0-3 tháng', '0-3 Months', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (75, '3-6 tháng', '3-6 Months', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (76, '6-9 tháng', '6-9 Months', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (77, '9-12 tháng', '9-12 Months', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (78, '1-2 tuổi', '1-2 Years', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (79, '2-3 tuổi', '2-3 Years', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (80, '3-4 tuổi', '3-4 Years', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (81, '4-5 tuổi', '4-5 Years', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (82, '5-6 tuổi', '5-6 Years', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (83, '6-7 tuổi', '6-7 Years', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (84, '7-8 tuổi', '7-8 Years', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (85, '8-9 tuổi', '8-9 Years', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (86, '9-10 tuổi', '9-10 Years', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (87, '10-11 tuổi', '10-11 Years', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (88, '11-12 tuổi', '11-12 Years', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (89, 'Freesize', 'Kích cỡ tự do', 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Kích cỡ giày (ID: 6) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (6, 'Kích cỡ giày', 'Kích cỡ giày theo chuẩn EU phổ biến tại Việt Nam', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (6, 16);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (6, 27);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (6, 13);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (6, 20);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (90, '26', 'EU Size 26', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (91, '27', 'EU Size 27', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (92, '28', 'EU Size 28', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (93, '29', 'EU Size 29', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (94, '30', 'EU Size 30', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (95, '31', 'EU Size 31', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (96, '32', 'EU Size 32', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (97, '33', 'EU Size 33', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (98, '34', 'EU Size 34', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (99, '35', 'EU Size 35', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (100, '36', 'EU Size 36', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (101, '37', 'EU Size 37', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (102, '38', 'EU Size 38', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (103, '39', 'EU Size 39', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (104, '40', 'EU Size 40', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (105, '41', 'EU Size 41', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (106, '42', 'EU Size 42', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (107, '43', 'EU Size 43', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (108, '44', 'EU Size 44', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (109, '45', 'EU Size 45', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (110, '46', 'EU Size 46', 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Kích cỡ dép (ID: 7) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (7, 'Kích cỡ dép', 'Kích cỡ dép, sandal và xăng đan', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (7, 16);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (7, 27);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (7, 13);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (7, 20);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (111, '36-37', 'Size 36-37', 7) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (112, '38-39', 'Size 38-39', 7) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (113, '40-41', 'Size 40-41', 7) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (114, '42-43', 'Size 42-43', 7) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (115, '44-45', 'Size 44-45', 7) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (116, 'Freesize', 'Kích cỡ tự do', 7) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Kích cỡ vòng ngực (ID: 8) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (8, 'Kích cỡ vòng ngực', 'Kích cỡ áo ngực theo vòng ngực và cỡ ly', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (8, 26);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (8, 20);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (117, '70A', 'Band 70, Cup A', 8) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (118, '70B', 'Band 70, Cup B', 8) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (119, '70C', 'Band 70, Cup C', 8) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (120, '75A', 'Band 75, Cup A', 8) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (121, '75B', 'Band 75, Cup B', 8) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (122, '75C', 'Band 75, Cup C', 8) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (123, '80B', 'Band 80, Cup B', 8) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (124, '80C', 'Band 80, Cup C', 8) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (125, '85B', 'Band 85, Cup B', 8) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (126, '85C', 'Band 85, Cup C', 8) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (127, 'Freesize', 'Kích cỡ tự do', 8) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Kiểu cổ áo (ID: 9) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (9, 'Kiểu cổ áo', 'Kiểu thiết kế cổ áo', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (9, 15);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (9, 26);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (9, 13);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (128, 'Cổ tròn', 'Round Neck', 9) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (129, 'Cổ tim', 'V-neck', 9) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (130, 'Cổ thuyền', 'Boat Neck', 9) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (131, 'Cổ sơ mi', 'Shirt Collar', 9) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (132, 'Cổ lọ', 'Turtleneck', 9) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (133, 'Cổ trễ', 'Off-shoulder', 9) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (134, 'Cổ nút', 'Button Collar', 9) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (135, 'Khác', 'Other', 9) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Chiều dài tay áo (ID: 10) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (10, 'Chiều dài tay áo', 'Độ dài tay áo của sản phẩm thời trang', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (10, 15);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (10, 26);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (10, 13);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (10, 20);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (136, 'Tay lửng', 'Sleeveless', 10) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (137, 'Tay ngắn', 'Short Sleeve', 10) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (138, 'Tay 3/4', 'Three-quarter Sleeve', 10) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (139, 'Tay dài', 'Long Sleeve', 10) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Chiều dài quần (ID: 11) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (11, 'Chiều dài quần', 'Độ dài của quần, shorts hoặc chân váy', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (11, 15);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (11, 26);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (11, 13);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (11, 20);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (140, 'Quần short', 'Shorts', 11) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (141, 'Quần dài', 'Full Length', 11) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (142, 'Quần 7 phần', 'Capri / 7/8 Length', 11) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (143, 'Quần 9 phần', 'Ankle Length', 11) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (144, 'Chân váy ngắn', 'Mini Skirt', 11) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (145, 'Chân váy dài', 'Maxi Skirt', 11) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Dung lượng RAM (ID: 12) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (12, 'Dung lượng RAM', 'Dung lượng bộ nhớ truy cập ngẫu nhiên của điện thoại, máy tính và thiết bị số', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (12, 17);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (12, 5);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (12, 6);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (146, '2GB', '2 Gigabytes', 12) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (147, '3GB', '3 Gigabytes', 12) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (148, '4GB', '4 Gigabytes', 12) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (149, '6GB', '6 Gigabytes', 12) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (150, '8GB', '8 Gigabytes', 12) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (151, '12GB', '12 Gigabytes', 12) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (152, '16GB', '16 Gigabytes', 12) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (153, '24GB', '24 Gigabytes', 12) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (154, '32GB', '32 Gigabytes', 12) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (155, '64GB', '64 Gigabytes', 12) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Bộ nhớ trong (ROM) (ID: 13) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (13, 'Bộ nhớ trong (ROM)', 'Dung lượng lưu trữ nội bộ của điện thoại, máy tính bảng và thiết bị số', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (13, 17);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (13, 5);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (13, 6);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (156, '16GB', '16 Gigabytes', 13) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (157, '32GB', '32 Gigabytes', 13) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (158, '64GB', '64 Gigabytes', 13) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (159, '128GB', '128 Gigabytes', 13) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (160, '256GB', '256 Gigabytes', 13) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (161, '512GB', '512 Gigabytes', 13) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (162, '1TB', '1 Terabyte', 13) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (163, '2TB', '2 Terabytes', 13) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Dung lượng thẻ nhớ (ID: 14) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (14, 'Dung lượng thẻ nhớ', 'Dung lượng lưu trữ của thẻ nhớ SD, microSD hoặc CF', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (14, 17);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (14, 5);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (14, 4);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (14, 6);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (164, '8GB', '8 Gigabytes', 14) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (165, '16GB', '16 Gigabytes', 14) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (166, '32GB', '32 Gigabytes', 14) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (167, '64GB', '64 Gigabytes', 14) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (168, '128GB', '128 Gigabytes', 14) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (169, '256GB', '256 Gigabytes', 14) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (170, '512GB', '512 Gigabytes', 14) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (171, '1TB', '1 Terabyte', 14) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Kích thước màn hình (ID: 15) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (15, 'Kích thước màn hình', 'Kích thước màn hình theo đường chéo, tính bằng inch', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (15, 17);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (15, 5);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (15, 6);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (15, 4);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (172, '5 inch', '5 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (173, '5.5 inch', '5.5 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (174, '6.1 inch', '6.1 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (175, '6.5 inch', '6.5 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (176, '6.7 inch', '6.7 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (177, '7 inch', '7 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (178, '10 inch', '10 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (179, '11 inch', '11 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (180, '13 inch', '13 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (181, '14 inch', '14 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (182, '15.6 inch', '15.6 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (183, '16 inch', '16 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (184, '17 inch', '17 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (185, '24 inch', '24 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (186, '27 inch', '27 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (187, '32 inch', '32 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (188, '43 inch', '43 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (189, '50 inch', '50 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (190, '55 inch', '55 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (191, '65 inch', '65 Inches', 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Độ phân giải màn hình (ID: 16) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (16, 'Độ phân giải màn hình', 'Độ phân giải hiển thị của màn hình hoặc camera', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (16, 17);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (16, 5);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (16, 6);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (16, 4);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (192, 'HD', '1280 x 720', 16) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (193, 'Full HD', '1920 x 1080', 16) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (194, '2K', '2560 x 1440', 16) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (195, '4K', '3840 x 2160', 16) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (196, '5K', '5120 x 2880', 16) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (197, '8K', '7680 x 4320', 16) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Hệ điều hành (ID: 17) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (17, 'Hệ điều hành', 'Hệ điều hành tương thích hoặc được cài đặt trên thiết bị', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (17, 17);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (17, 5);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (17, 6);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (198, 'Android', 'Android OS', 17) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (199, 'iOS', 'Apple iOS', 17) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (200, 'iPadOS', 'Apple iPadOS', 17) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (201, 'Windows', 'Microsoft Windows', 17) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (202, 'macOS', 'Apple macOS', 17) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (203, 'Linux', 'Linux OS', 17) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (204, 'ChromeOS', 'Google ChromeOS', 17) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (205, 'Khác', 'Other', 17) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Loại kết nối (ID: 18) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (18, 'Loại kết nối', 'Chuẩn kết nối hoặc cổng giao tiếp của thiết bị và phụ kiện', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (18, 17);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (18, 5);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (18, 6);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (18, 4);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (18, 1);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (206, 'USB-A', 'USB Type-A', 18) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (207, 'USB-C', 'USB Type-C', 18) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (208, 'Micro USB', 'Micro USB', 18) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (209, 'Lightning', 'Apple Lightning', 18) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (210, 'HDMI', 'HDMI', 18) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (211, 'DisplayPort', 'DisplayPort', 18) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (212, 'Bluetooth', 'Bluetooth', 18) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (213, 'Wi-Fi', 'Wireless Fidelity', 18) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (214, 'NFC', 'Near Field Communication', 18) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (215, 'Jack 3.5mm', '3.5mm Audio Jack', 18) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (216, 'RJ45', 'Ethernet RJ45', 18) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (217, 'Khác', 'Other', 18) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Dung lượng pin (ID: 19) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (19, 'Dung lượng pin', 'Dung lượng pin của thiết bị hoặc pin sạc dự phòng, tính bằng mAh', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (19, 17);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (19, 5);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (19, 6);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (19, 4);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (218, 'Dưới 2.000mAh', 'Under 2,000mAh', 19) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (219, '2.000mAh', '2,000mAh', 19) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (220, '5.000mAh', '5,000mAh', 19) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (221, '10.000mAh', '10,000mAh', 19) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (222, '20.000mAh', '20,000mAh', 19) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (223, '30.000mAh', '30,000mAh', 19) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (224, 'Trên 30.000mAh', 'Above 30,000mAh', 19) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Công suất (ID: 20) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (20, 'Công suất', 'Công suất hoạt động của thiết bị điện, tính bằng Watt', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (20, 10);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (20, 6);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (20, 5);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (20, 22);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (20, 2);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (20, 9);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (225, 'Dưới 500W', 'Under 500 Watts', 20) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (226, '500W', '500 Watts', 20) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (227, '800W', '800 Watts', 20) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (228, '1.000W', '1,000 Watts', 20) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (229, '1.200W', '1,200 Watts', 20) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (230, '1.500W', '1,500 Watts', 20) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (231, '2.000W', '2,000 Watts', 20) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (232, '2.500W', '2,500 Watts', 20) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (233, '3.000W', '3,000 Watts', 20) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (234, 'Trên 3.000W', 'Above 3,000 Watts', 20) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Dung tích (ID: 21) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (21, 'Dung tích', 'Dung tích hoặc thể tích chứa của sản phẩm, tính bằng mililít hoặc lít', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (21, 2);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (21, 9);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (21, 8);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (21, 10);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (21, 12);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (21, 11);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (21, 18);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (21, 19);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (235, '5ml', '5 Milliliters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (236, '10ml', '10 Milliliters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (237, '15ml', '15 Milliliters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (238, '30ml', '30 Milliliters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (239, '50ml', '50 Milliliters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (240, '100ml', '100 Milliliters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (241, '150ml', '150 Milliliters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (242, '200ml', '200 Milliliters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (243, '250ml', '250 Milliliters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (244, '500ml', '500 Milliliters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (245, '750ml', '750 Milliliters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (246, '1 lít', '1 Liter', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (247, '1,5 lít', '1.5 Liters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (248, '2 lít', '2 Liters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (249, '5 lít', '5 Liters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (250, '10 lít', '10 Liters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (251, '20 lít', '20 Liters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (252, 'Trên 20 lít', 'Above 20 Liters', 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Trọng lượng (ID: 22) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (22, 'Trọng lượng', 'Khối lượng hoặc trọng lượng đóng gói của sản phẩm', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (22, 2);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (22, 9);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (22, 8);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (22, 12);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (22, 11);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (22, 18);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (22, 19);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (22, 20);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (22, 22);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (253, '10g', '10 Grams', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (254, '20g', '20 Grams', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (255, '30g', '30 Grams', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (256, '50g', '50 Grams', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (257, '100g', '100 Grams', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (258, '200g', '200 Grams', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (259, '250g', '250 Grams', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (260, '500g', '500 Grams', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (261, '1kg', '1 Kilogram', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (262, '2kg', '2 Kilograms', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (263, '5kg', '5 Kilograms', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (264, '10kg', '10 Kilograms', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (265, '20kg', '20 Kilograms', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (266, 'Trên 20kg', 'Above 20 Kilograms', 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Loại da (ID: 23) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (23, 'Loại da', 'Phân loại da phù hợp với mỹ phẩm và sản phẩm chăm sóc cá nhân', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (23, 2);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (23, 9);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (267, 'Da thường', 'Normal Skin', 23) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (268, 'Da khô', 'Dry Skin', 23) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (269, 'Da dầu', 'Oily Skin', 23) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (270, 'Da hỗn hợp', 'Combination Skin', 23) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (271, 'Da nhạy cảm', 'Sensitive Skin', 23) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (272, 'Mọi loại da', 'All Skin Types', 23) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Màu sắc trang điểm (ID: 24) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (24, 'Màu sắc trang điểm', 'Gam màu hoặc tone trang điểm của mỹ phẩm', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (24, 2);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (273, 'Tone sáng', 'Light Tone', 24) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (274, 'Tone trung bình', 'Medium Tone', 24) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (275, 'Tone tự nhiên', 'Natural Tone', 24) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (276, 'Tone ấm', 'Warm Tone', 24) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (277, 'Tone lạnh', 'Cool Tone', 24) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (278, 'Tone hồng', 'Pink Tone', 24) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (279, 'Tone cam đất', 'Terracotta Tone', 24) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (280, 'Tone nude', 'Nude Tone', 24) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (281, 'Tone đỏ', 'Red Tone', 24) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (282, 'Tone nâu', 'Brown Tone', 24) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Đường kính mặt số (ID: 25) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (25, 'Đường kính mặt số', 'Đường kính mặt đồng hồ, tính bằng milimet', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (25, 24);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (283, 'Dưới 34mm', 'Under 34mm', 25) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (284, '34mm', '34mm', 25) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (285, '36mm', '36mm', 25) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (286, '38mm', '38mm', 25) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (287, '40mm', '40mm', 25) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (288, '42mm', '42mm', 25) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (289, '44mm', '44mm', 25) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (290, '46mm', '46mm', 25) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (291, 'Trên 46mm', 'Above 46mm', 25) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Chất liệu dây đồng hồ (ID: 26) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (26, 'Chất liệu dây đồng hồ', 'Chất liệu dây hoặc vòng đeo của đồng hồ', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (26, 24);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (292, 'Da thật', 'Genuine Leather', 26) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (293, 'Da PU', 'PU Leather', 26) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (294, 'Thép không gỉ', 'Stainless Steel', 26) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (295, 'Silicone', 'Silicone', 26) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (296, 'Cao su', 'Rubber', 26) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (297, 'Nylon', 'Nylon', 26) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (298, 'Vải', 'Fabric', 26) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (299, 'Titan', 'Titanium', 26) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (300, 'Vàng kim loại', 'Gold Metal', 26) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (301, 'Khác', 'Other', 26) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Kiểu máy đồng hồ (ID: 27) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (27, 'Kiểu máy đồng hồ', 'Cơ chế vận hành của đồng hồ', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (27, 24);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (302, 'Quartz', 'Quartz Movement', 27) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (303, 'Automatic', 'Automatic Movement', 27) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (304, 'Mechanical', 'Mechanical Movement', 27) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (305, 'Smartwatch', 'Smartwatch', 27) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (306, 'Năng lượng mặt trời', 'Solar Powered', 27) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (307, 'Khác', 'Other', 27) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Chống nước (ID: 28) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (28, 'Chống nước', 'Mức khả năng chống nước của sản phẩm', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (28, 24);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (28, 17);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (28, 4);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (28, 20);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (28, 6);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (308, 'Không chống nước', 'Not Water Resistant', 28) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (309, 'Chống nước nhẹ', 'Splash Resistant', 28) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (310, '3ATM', '3 ATM Water Resistance', 28) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (311, '5ATM', '5 ATM Water Resistance', 28) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (312, '10ATM', '10 ATM Water Resistance', 28) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (313, 'IPX4', 'IPX4 Water Resistance', 28) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (314, 'IPX7', 'IPX7 Water Resistance', 28) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (315, 'IP68', 'IP68 Water Resistance', 28) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Số lượng món (ID: 29) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (29, 'Số lượng món', 'Số lượng món trong một bộ sản phẩm hoặc combo', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (316, '1 món', '1 Item', 29) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (317, '2 món', '2 Items', 29) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (318, '3 món', '3 Items', 29) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (319, '4 món', '4 Items', 29) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (320, '5 món', '5 Items', 29) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (321, '6 món', '6 Items', 29) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (322, 'Bộ 10 món', 'Set of 10', 29) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (323, 'Bộ 12 món', 'Set of 12', 29) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (324, 'Bộ 24 món', 'Set of 24', 29) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (325, 'Bộ 50 món', 'Set of 50', 29) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (326, 'Bộ 100 món', 'Set of 100', 29) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Số lượng gói (ID: 30) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (30, 'Số lượng gói', 'Số lượng gói, túi hoặc hộp trong một đơn vị bán', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (30, 8);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (30, 2);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (30, 9);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (30, 11);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (30, 18);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (30, 19);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (327, '1 gói', '1 Pack', 30) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (328, '2 gói', '2 Packs', 30) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (329, '3 gói', '3 Packs', 30) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (330, '5 gói', '5 Packs', 30) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (331, '10 gói', '10 Packs', 30) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (332, '20 gói', '20 Packs', 30) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (333, '30 gói', '30 Packs', 30) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (334, '50 gói', '50 Packs', 30) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (335, '100 gói', '100 Packs', 30) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Hương thơm (ID: 31) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (31, 'Hương thơm', 'Hương thơm chính của mỹ phẩm, nước hoa, sản phẩm chăm sóc cá nhân hoặc gia dụng', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (31, 2);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (31, 9);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (31, 11);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (31, 12);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (336, 'Không mùi', 'Fragrance-free', 31) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (337, 'Hoa hồng', 'Rose', 31) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (338, 'Lavender', 'Lavender', 31) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (339, 'Trà xanh', 'Green Tea', 31) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (340, 'Cam chanh', 'Citrus', 31) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (341, 'Dừa', 'Coconut', 31) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (342, 'Vanilla', 'Vanilla', 31) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (343, 'Gỗ phương Đông', 'Woody', 31) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (344, 'Ocean', 'Oceanic', 31) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (345, 'Sữa', 'Milk', 31) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (346, 'Khác', 'Other', 31) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Dung tích bình sữa (ID: 32) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (32, 'Dung tích bình sữa', 'Dung tích bình sữa hoặc dụng cụ cho bé', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (32, 18);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (347, '60ml', '60 Milliliters', 32) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (348, '90ml', '90 Milliliters', 32) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (349, '120ml', '120 Milliliters', 32) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (350, '150ml', '150 Milliliters', 32) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (351, '180ml', '180 Milliliters', 32) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (352, '240ml', '240 Milliliters', 32) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (353, '300ml', '300 Milliliters', 32) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Độ tuổi phù hợp (ID: 33) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (33, 'Độ tuổi phù hợp', 'Độ tuổi người dùng phù hợp với sản phẩm', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (33, 23);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (33, 18);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (33, 13);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (33, 3);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (33, 9);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (354, '0-12 tháng', '0-12 Months', 33) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (355, '1-2 tuổi', '1-2 Years', 33) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (356, '3-5 tuổi', '3-5 Years', 33) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (357, '6-8 tuổi', '6-8 Years', 33) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (358, '9-12 tuổi', '9-12 Years', 33) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (359, 'Trên 12 tuổi', 'Above 12 Years', 33) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (360, 'Người lớn', 'Adult', 33) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (361, 'Mọi lứa tuổi', 'All Ages', 33) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Giới tính phù hợp (ID: 34) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (34, 'Giới tính phù hợp', 'Giới tính người dùng phù hợp với sản phẩm', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (34, 15);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (34, 26);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (34, 13);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (34, 16);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (34, 27);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (34, 24);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (34, 7);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (34, 23);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (34, 18);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (34, 20);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (362, 'Nam', 'Male', 34) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (363, 'Nữ', 'Female', 34) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (364, 'Unisex', 'Unisex', 34) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (365, 'Bé trai', 'Boys', 34) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (366, 'Bé gái', 'Girls', 34) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Loại thú cưng (ID: 35) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (35, 'Loại thú cưng', 'Loại thú cưng phù hợp với sản phẩm', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (35, 19);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (367, 'Chó', 'Dog', 35) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (368, 'Mèo', 'Cat', 35) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (369, 'Chim', 'Bird', 35) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (370, 'Cá', 'Fish', 35) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (371, 'Hamster', 'Hamster', 35) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (372, 'Thỏ', 'Rabbit', 35) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (373, 'Bò sát', 'Reptile', 35) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (374, 'Đa loại thú cưng', 'Multiple Pets', 35) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Cỡ thú cưng (ID: 36) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (36, 'Cỡ thú cưng', 'Kích cỡ thú cưng phù hợp với sản phẩm', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (36, 19);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (375, 'Nhỏ', 'Small', 36) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (376, 'Trung bình', 'Medium', 36) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (377, 'Lớn', 'Large', 36) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (378, 'Rất lớn', 'Extra Large', 36) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Loại xe phù hợp (ID: 37) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (37, 'Loại xe phù hợp', 'Loại phương tiện phù hợp với phụ kiện hoặc sản phẩm ô tô, xe máy', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (37, 1);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (379, 'Ô tô', 'Car', 37) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (380, 'Xe máy', 'Motorcycle', 37) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (381, 'Xe đạp', 'Bicycle', 37) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (382, 'Xe điện', 'Electric Vehicle', 37) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (383, 'Xe tải', 'Truck', 37) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (384, 'Đa dụng', 'Universal', 37) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Kích thước khung ảnh (ID: 38) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (38, 'Kích thước khung ảnh', 'Kích thước ảnh phù hợp với khung ảnh hoặc album', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (38, 12);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (38, 3);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (385, '3x4 cm', '3x4 cm', 38) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (386, '4x6 cm', '4x6 cm', 38) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (387, '9x12 cm', '9x12 cm', 38) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (388, '10x15 cm', '10x15 cm', 38) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (389, '13x18 cm', '13x18 cm', 38) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (390, '20x25 cm', '20x25 cm', 38) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (391, '30x40 cm', '30x40 cm', 38) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (392, 'A4', 'A4 Size', 38) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (393, 'A3', 'A3 Size', 38) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Khổ giấy (ID: 39) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (39, 'Khổ giấy', 'Khổ giấy chuẩn của sổ, vở, giấy in hoặc văn phòng phẩm', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (39, 3);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (39, 12);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (394, 'A5', 'A5 Size', 39) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (395, 'A4', 'A4 Size', 39) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (396, 'A3', 'A3 Size', 39) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (397, 'B5', 'B5 Size', 39) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (398, 'Letter', 'Letter Size', 39) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (399, 'Khác', 'Other', 39) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Số trang (ID: 40) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (40, 'Số trang', 'Số trang của sổ, vở hoặc sách', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (40, 3);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (400, 'Dưới 50 trang', 'Under 50 Pages', 40) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (401, '50 trang', '50 Pages', 40) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (402, '100 trang', '100 Pages', 40) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (403, '200 trang', '200 Pages', 40) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (404, '300 trang', '300 Pages', 40) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (405, '500 trang', '500 Pages', 40) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (406, 'Trên 500 trang', 'Above 500 Pages', 40) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Loại bìa sách (ID: 41) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (41, 'Loại bìa sách', 'Kiểu bìa của sách, sổ hoặc vở', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (41, 3);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (407, 'Bìa mềm', 'Paperback', 41) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (408, 'Bìa cứng', 'Hardcover', 41) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (409, 'Bìa lò xo', 'Spiral Binding', 41) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (410, 'Bìa keo gáy', 'Perfect Binding', 41) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (411, 'Khác', 'Other', 41) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Loại voucher (ID: 42) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (42, 'Loại voucher', 'Loại hình voucher, vé hoặc dịch vụ', 1, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (42, 21);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (412, 'Voucher ăn uống', 'Food & Beverage Voucher', 42) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (413, 'Voucher làm đẹp', 'Beauty Voucher', 42) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (414, 'Voucher du lịch', 'Travel Voucher', 42) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (415, 'Vé xem phim', 'Movie Ticket', 42) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (416, 'Vé sự kiện', 'Event Ticket', 42) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (417, 'Vé tham quan', 'Attraction Ticket', 42) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (418, 'Dịch vụ vận chuyển', 'Delivery Service', 42) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (419, 'Dịch vụ sửa chữa', 'Repair Service', 42) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (420, 'Khác', 'Other', 42) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Hạn sử dụng (ID: 43) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (43, 'Hạn sử dụng', 'Thời hạn sử dụng hoặc hiệu lực của sản phẩm, voucher', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (43, 21);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (43, 8);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (43, 2);
INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (43, 9);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (421, 'Dưới 1 tháng', 'Under 1 Month', 43) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (422, '1 tháng', '1 Month', 43) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (423, '3 tháng', '3 Months', 43) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (424, '6 tháng', '6 Months', 43) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (425, '12 tháng', '12 Months', 43) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (426, '24 tháng', '24 Months', 43) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (427, 'Trên 24 tháng', 'Above 24 Months', 43) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ================= Xuất xứ (ID: 44) =================
INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (44, 'Xuất xứ', 'Quốc gia hoặc vùng sản xuất chính của sản phẩm', 0, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (428, 'Việt Nam', 'Vietnam', 44) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (429, 'Trung Quốc', 'China', 44) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (430, 'Hàn Quốc', 'South Korea', 44) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (431, 'Nhật Bản', 'Japan', 44) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (432, 'Thái Lan', 'Thailand', 44) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (433, 'Đài Loan', 'Taiwan', 44) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (434, 'Mỹ', 'United States', 44) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (435, 'Pháp', 'France', 44) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (436, 'Đức', 'Germany', 44) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (437, 'Ý', 'Italy', 44) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO specifications (id, name, description, specification_type_id) VALUES (438, 'Khác', 'Other', 44) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

SET FOREIGN_KEY_CHECKS = 1;
