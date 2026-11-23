import { useState } from "react";

export default function PriceRangeFilter({ minPrice, maxPrice, onApply }) {
  const [minPriceInput, setMinPriceInput] = useState(minPrice ?? "");
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice ?? "");

  return (
    <div className="mb-5">
      <h4 className="text-sm font-medium mb-2">Khoảng Giá</h4>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="number"
          aria-label="Giá tối thiểu" placeholder="₫ TỪ"
          className="input input-bordered input-sm w-full max-w-[90px] px-2"
          value={minPriceInput}
          onChange={(e) => setMinPriceInput(e.target.value)}
        />
        <span className="text-base-300">-</span>
        <input
          type="number"
          aria-label="Giá tối đa" placeholder="₫ ĐẾN"
          className="input input-bordered input-sm w-full max-w-[90px] px-2"
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
