INSERT INTO categories (name, slug, parent_id, image_url, is_active, version) VALUES
-- Thêm danh mục con cho Automotive (Giả sử ID = 1)
('Car Accessories', 'car-accessories', 1, 'car-accessories.png', true, 0),
('Motorcycle Parts', 'motorcycle-parts', 1, 'motorcycle-parts.png', true, 0),

-- Thêm danh mục con cho Beauty (Giả sử ID = 2)
('Skincare', 'skincare', 2, 'skincare.png', true, 0),
('Makeup', 'makeup', 2, 'makeup.png', true, 0),
('Perfume', 'perfume', 2, 'perfume.png', true, 0),

-- Thêm danh mục con cho Computer Accessories (Giả sử ID = 5)
('Laptops', 'laptops', 5, 'laptops.png', true, 0),
('Keyboards & Mice', 'keyboards-mice', 5, 'keyboards-mice.png', true, 0),

-- Thêm danh mục con cho Men Clothes (Giả sử ID = 15)
('Men Shirts', 'men-shirts', 15, 'men-shirts.png', true, 0),
('Men Pants', 'men-pants', 15, 'men-pants.png', true, 0),
('Men Jackets', 'men-jackets', 15, 'men-jackets.png', true, 0),

-- Thêm danh mục con cho Women Clothes (Giả sử ID = 26)
('Dresses', 'dresses', 26, 'dresses.png', true, 0),
('Tops', 'women-tops', 26, 'women-tops.png', true, 0),
('Skirts', 'skirts', 26, 'skirts.png', true, 0);