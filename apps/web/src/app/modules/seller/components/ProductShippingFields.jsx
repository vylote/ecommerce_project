import FormInput from "../../../shared/ui/FormInput";
export default function ProductShippingFields({ productForm, errors, handleInputChange }) {
  return (
    <>
      <div className="border-b pb-3">
        <h2 className="text-lg font-bold text-gray-800">Kích thước & Trọng lượng</h2>
        <p className="text-xs text-gray-500">
          Cung cấp trọng lượng sau khi đóng gói để sàn tính phí vận chuyển chính xác cho khách hàng.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="form-control">
          <label className="label font-semibold text-sm">
            Trọng lượng (gr) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="weight"
            value={productForm.weight}
            onChange={handleInputChange}
            className={`input input-bordered ${errors.weight ? "border-red-500 focus:border-red-500" : "focus:border-green-600"}`}
            placeholder="Ví dụ: 300"
 />
          {errors.weight && <span className="text-xs text-red-500 mt-1">{errors.weight}</span>}
        </div>

        <div className="form-control">
          <label className="label font-medium text-sm">Dài (cm)</label>
          <FormInput
            type="number"
            name="length"
            value={productForm.length}
            onChange={handleInputChange}
            focusColor="green"
            placeholder="L"
 />
        </div>

        <div className="form-control">
          <label className="label font-medium text-sm">Rộng (cm)</label>
          <FormInput
            type="number"
            name="width"
            value={productForm.width}
            onChange={handleInputChange}
            focusColor="green"
            placeholder="W"
 />
        </div>

        <div className="form-control">
          <label className="label font-medium text-sm">Cao (cm)</label>
          <FormInput
            type="number"
            name="height"
            value={productForm.height}
            onChange={handleInputChange}
            focusColor="green"
            placeholder="H"
 />
        </div>
      </div>

      {/* Đối tác vận chuyển */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-3">
        <h3 className="font-semibold text-sm text-gray-800">Đơn vị vận chuyển hỗ trợ</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="checkbox checkbox-sm accent-green-600" />
            <span>Giao hàng nhanh (GHN)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="checkbox checkbox-sm accent-green-600" />
            <span>Giao hàng tiết kiệm (GHTK)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="checkbox checkbox-sm accent-green-600" />
            <span>Viettel Post</span>
          </label>
        </div>
      </div>
    </>
  );
}
