import FormInput from "../../../../shared/ui/FormInput";
import { useState } from "react";

export default function PriceRangeFilter({ minPrice, maxPrice, onApply }) {
  const [minPriceInput, setMinPriceInput] = useState(minPrice ?? "");
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice ?? "");
  const hasAppliedPrice = Boolean(minPrice || maxPrice);
  const canClearPrice = hasAppliedPrice || Boolean(minPriceInput || maxPriceInput);

  function clearPrice() {
    setMinPriceInput("");
    setMaxPriceInput("");
    if (hasAppliedPrice) onApply(null, null);
  }

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium">Khoảng Giá</h4>
        {canClearPrice && (
          <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={clearPrice}>
            Xóa giá
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <FormInput
          type="number"
          aria-label="Giá tối thiểu" placeholder="₫ TỪ"
          controlSize="sm" className="w-full max-w-[90px] px-2"
          value={minPriceInput}
          onChange={(e) => setMinPriceInput(e.target.value)}
        />
        <span className="text-base-300">-</span>
        <FormInput
          type="number"
          aria-label="Giá tối đa" placeholder="₫ ĐẾN"
          controlSize="sm" className="w-full max-w-[90px] px-2"
          value={maxPriceInput}
          onChange={(e) => setMaxPriceInput(e.target.value)}
        />
      </div>
      <button
        className="btn btn-primary btn-sm w-full text-white"
        type="button"
        onClick={() => onApply(minPriceInput, maxPriceInput)}
      >
        Áp dụng
      </button>
    </div>
  );
}
