export default function ProductBasicFields({ productForm, categories, errors, handleInputChange }) {
  return (
    <>
      {/* Tên sản phẩm */}
      <div className="form-control">
        <label htmlFor="product-name" className="label font-semibold text-sm">
          Tên sản phẩm <span className="text-red-500">*</span>
        </label>
        <input
          id="product-name"
          type="text"
          name="name"
          value={productForm.name}
          onChange={handleInputChange}
          className={`input input-bordered ${errors.name ? "border-red-500 focus:border-red-500" : "focus:border-green-600"}`}
          placeholder="Nhập tên sản phẩm (Ví dụ: Áo thun Polo Nam thoáng khí...)"
        />
        {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
      </div>

      {/* Ngành hàng */}
      <div className="form-control">
        <label htmlFor="product-categoryId" className="label font-semibold text-sm">
          Ngành hàng <span className="text-red-500">*</span>
        </label>
        <select
          id="product-categoryId"
          name="categoryId"
          value={productForm.categoryId}
          onChange={handleInputChange}
          className={`select select-bordered ${errors.categoryId ? "border-red-500 focus:border-red-500" : "focus:border-green-600"}`}
        >
          <option value="">-- Chọn ngành hàng phù hợp --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <span className="text-xs text-red-500 mt-1">{errors.categoryId}</span>
        )}
      </div>

      {/* Mô tả */}
      <div className="form-control">
        <label htmlFor="product-description" className="label font-semibold text-sm">
          Mô tả sản phẩm <span className="text-red-500">*</span>
        </label>
        <textarea
          id="product-description"
          name="description"
          value={productForm.description}
          onChange={handleInputChange}
          className={`textarea textarea-bordered h-36 ${errors.description ? "border-red-500 focus:border-red-500" : "focus:border-green-600"}`}
          placeholder="Nhập mô tả sản phẩm chi tiết về chất liệu, tính năng, cách bảo quản..."
        ></textarea>
        {errors.description && (
          <span className="text-xs text-red-500 mt-1">{errors.description}</span>
        )}
      </div>
    </>
  );
}
