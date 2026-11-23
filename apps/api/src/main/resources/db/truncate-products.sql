-- Tắt kiểm tra khoá ngoại để có thể xoá bảng products
SET FOREIGN_KEY_CHECKS = 0;

-- Xoá dữ liệu các bảng liên quan đến Product
TRUNCATE TABLE product_images;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE order_items;
TRUNCATE TABLE reviews;

-- Cuối cùng xoá bảng products
TRUNCATE TABLE products;

-- Bật lại kiểm tra khoá ngoại
SET FOREIGN_KEY_CHECKS = 1;
