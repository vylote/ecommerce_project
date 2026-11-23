import FormInput from "../../../shared/ui/FormInput";
export default function VariantInventoryTable({
  variants, batchPrice, batchStock, setBatchPrice, setBatchStock,
  handleApplyBatch, handleVariantChange, error,
}) {
  if (!variants.length) return error ? <p role="alert" className="text-xs font-medium text-error">{error}</p> : null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-green-50 border border-green-200 p-3 rounded-lg">
        <span className="text-xs font-bold text-green-900">
          Áp dụng nhanh cho tất cả {variants.length} phân loại:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <FormInput
            type="number"
            value={batchPrice}
            onChange={(e) => setBatchPrice(e.target.value)}
            aria-label="Giá áp dụng hàng loạt"
            placeholder="Giá chung (₫)"
            controlSize="xs" className="w-28 bg-white"
 />
          <FormInput
            type="number"
            value={batchStock}
            onChange={(e) => setBatchStock(e.target.value)}
            aria-label="Tồn kho áp dụng hàng loạt"
            placeholder="Kho chung"
            controlSize="xs" className="w-24 bg-white"
 />
          <button
            type="button"
            onClick={handleApplyBatch}
            className="btn btn-xs bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            Áp dụng
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="table table-compact w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-4">Tên phân loại hàng</th>
              <th className="py-3 px-4">Giá bán (₫) *</th>
              <th className="py-3 px-4">Kho ban đầu *</th>
              <th className="py-3 px-4">Mã SKU (Tùy chọn)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {variants.map((v, idx) => (
              <tr key={v.key} className="hover:bg-gray-50/60">
                <td className="py-2.5 px-4 font-semibold text-gray-800">
                  {v.name}
                </td>
                <td className="py-2.5 px-4 w-44">
                  <FormInput
                    type="number"
                    aria-label={`Giá bán - ${v.name}`}
                    value={v.price}
                    onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                    placeholder="Giá bán"
                    controlSize="sm" focusColor="green" className="w-full"
 />
                </td>
                <td className="py-2.5 px-4 w-36">
                  <FormInput
                    type="number"
                    aria-label={`Tồn kho - ${v.name}`}
                    value={v.stock}
                    onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                    placeholder="Số lượng"
                    controlSize="sm" focusColor="green" className="w-full"
 />
                </td>
                <td className="py-2.5 px-4">
                  <FormInput
                    type="text"
                    aria-label={`SKU - ${v.name}`}
                    value={v.sku}
                    onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                    placeholder="SKU tự động"
                    controlSize="sm" focusColor="green" className="w-full"
 />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-error">{error}</p>
      )}
    </div>
  );
}
