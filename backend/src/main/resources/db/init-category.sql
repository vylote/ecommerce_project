-- Tắt kiểm tra khóa ngoại để có thể Truncate (Dành cho MySQL)
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa trắng bảng categories và reset lại ID (Auto Increment)
TRUNCATE TABLE categories;

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- Thêm lại dữ liệu chỉ với tên file ở cột image_url
INSERT INTO categories (name, slug, parent_id, image_url, is_active, version) VALUES
('Automotive', 'automotive', NULL, 'automotive.png', true, 0),
('Beauty', 'beauty', NULL, 'beauty.png', true, 0),
('Books & Stationery', 'books-stationery', NULL, 'books-stationery.png', true, 0),
('Cameras', 'cameras', NULL, 'cameras.png', true, 0),
('Computer Accessories', 'computer-accessories', NULL, 'computer-accessories.png', true, 0),
('Consumer Electronics', 'consumer-electronics', NULL, 'consumer-electronics.png', true, 0),
('Fashion Accessories', 'fashion-accessories', NULL, 'fashion-accessories.png', true, 0),
('Grocery', 'grocery', NULL, 'grocery.png', true, 0),
('Health', 'health', NULL, 'health.png', true, 0),
('Home Appliances', 'home-appliances', NULL, 'home-appliances.png', true, 0),
('Home Care', 'home-care', NULL, 'home-care.png', true, 0),
('Home Living', 'home-living', NULL, 'home-living.png', true, 0),
('Kid Fashion', 'kid-fashion', NULL, 'kid-fashion.png', true, 0),
('Men Bags', 'men-bags', NULL, 'men-bags.png', true, 0),
('Men Clothes', 'men-clothes', NULL, 'men-clothes.png', true, 0),
('Men Shoes', 'men-shoes', NULL, 'men-shoes.png', true, 0),
('Mobile Gadgets', 'mobile-gadgets', NULL, 'mobile-gadgets.png', true, 0),
('Moms, Kids & Babies', 'moms-kids-babies', NULL, 'moms-kids-babies.png', true, 0),
('Pets', 'pets', NULL, 'pets.png', true, 0),
('Sport & Outdoor', 'sport-outdoor', NULL, 'sport-outdoor.png', true, 0),
('Tickets, Vouchers & Services', 'tickets-vouchers-services', NULL, 'tickets-vouchers-services.png', true, 0),
('Tools & Home Improvement', 'tools-home-improvement', NULL, 'tools-home-improvement.png', true, 0),
('Toys', 'toys', NULL, 'toys.png', true, 0),
('Watches', 'watches', NULL, 'watches.png', true, 0),
('Women Bags', 'women-bags', NULL, 'women-bags.png', true, 0),
('Women Clothes', 'women-clothes', NULL, 'women-clothes.png', true, 0),
('Women Shoes', 'women-shoes', NULL, 'women-shoes.png', true, 0);
