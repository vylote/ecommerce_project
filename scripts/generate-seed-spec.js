const fs = require('fs');

const rawData = fs.readFileSync('/home/vylote/Projects/ecommerce_project/file1', 'utf8');
const specTypes = JSON.parse(rawData);

// Bản đồ ánh xạ tên Category sang Category ID trong DB
const categoryMap = {
  "Automotive": 1,
  "Beauty": 2,
  "Books & Stationery": 3,
  "Cameras": 4,
  "Computer Accessories": 5,
  "Consumer Electronics": 6,
  "Fashion Accessories": 7,
  "Grocery": 8,
  "Health": 9,
  "Home Appliances": 10,
  "Home Care": 11,
  "Home Living": 12,
  "Kid Fashion": 13,
  "Men Bags": 14,
  "Men Clothes": 15,
  "Men Shoes": 16,
  "Mobile Gadgets": 17,
  "Moms, Kids & Babies": 18,
  "Pets": 19,
  "Sport & Outdoor": 20,
  "Tickets, Vouchers & Services": 21,
  "Tools & Home Improvement": 22,
  "Toys": 23,
  "Watches": 24,
  "Women Bags": 25,
  "Women Clothes": 26,
  "Women Shoes": 27,
  "Car Accessories": 28,
  "Motorcycle Parts": 29,
  "Skincare": 30,
  "Makeup": 31,
  "Perfume": 32,
  "Laptops": 33,
  "Keyboards & Mice": 34,
  "Men Shirts": 35,
  "Men Pants": 36,
  "Men Jackets": 37,
  "Dresses": 38,
  "Tops": 39,
  "Skirts": 40
};

let sql = `-- Script nạp tự động toàn bộ 44 loại đặc tả và các giá trị chuẩn từ file1
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE category_specification_types;
TRUNCATE TABLE specifications;
TRUNCATE TABLE specification_types;

`;

const variantTypeIds = new Set([1, 2, 4, 5, 6, 7, 8, 12, 13, 14, 19, 21, 22, 24, 25, 29, 30, 31, 32, 36, 38, 39, 40, 41, 42]);

let typeId = 1;
let specId = 1;

for (const type of specTypes) {
  const typeNameEscaped = type.name.replace(/'/g, "''");
  const typeDescEscaped = (type.description || '').replace(/'/g, "''");
  const isVariant = variantTypeIds.has(typeId) ? 1 : 0;

  sql += `-- ================= ${type.name} (ID: ${typeId}) =================\n`;
  sql += `INSERT INTO specification_types (id, name, description, is_variant, created_at) VALUES (${typeId}, '${typeNameEscaped}', '${typeDescEscaped}', ${isVariant}, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_variant=VALUES(is_variant);\n`;

  // Liên kết Category
  if (type.applicableCategories && type.applicableCategories.length > 0) {
    for (const catName of type.applicableCategories) {
      const catId = categoryMap[catName];
      if (catId) {
        sql += `INSERT IGNORE INTO category_specification_types (specification_type_id, category_id) VALUES (${typeId}, ${catId});\n`;
      }
    }
  }

  // Chèn Specifications
  if (type.specifications && type.specifications.length > 0) {
    for (const spec of type.specifications) {
      const specNameEscaped = spec.name.replace(/'/g, "''");
      const specDescEscaped = (spec.description || '').replace(/'/g, "''");
      sql += `INSERT INTO specifications (id, name, description, specification_type_id) VALUES (${specId}, '${specNameEscaped}', '${specDescEscaped}', ${typeId}) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);\n`;
      specId++;
    }
  }

  sql += `\n`;
  typeId++;
}

sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

fs.writeFileSync('/home/vylote/Projects/ecommerce_project/backend/src/main/resources/db/seed-specifications.sql', sql);
console.log(`Đã tạo thành công seed-specifications.sql với ${typeId - 1} loại đặc tả và ${specId - 1} giá trị đặc tả!`);
