INSERT INTO commission_configs (rate, effective_from, category_id, created_by, version)
SELECT 
    0.05,            -- Mức phí hoa hồng mặc định (VD: 5%)
    CURRENT_DATE,    -- Ngày bắt đầu có hiệu lực là hôm nay
    c.id,            -- Duyệt qua tất cả category_id đang có
    (SELECT MIN(id) FROM users), -- Lấy ID của 1 tài khoản làm người tạo cấu hình
    0                -- Version Hibernate
FROM categories c
WHERE NOT EXISTS (
    -- Chỉ chèn nếu danh mục này chưa được cấu hình
    SELECT 1 FROM commission_configs cc WHERE cc.category_id = c.id
);
