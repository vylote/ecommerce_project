import { useState } from "react";

import PriceRangeFilter from "./PriceRangeFilter";
import RatingFilter from "./RatingFilter";

export default function CatalogFilters({ query }) {
  const { minPrice, maxPrice, minRating, changePrice, changeRating, clearFilters } = query;
  const [priceResetVersion, setPriceResetVersion] = useState(0);
  const hasActiveFilters = Boolean(minPrice || maxPrice || minRating);

  function resetFilters() {
    setPriceResetVersion((version) => version + 1);
    clearFilters();
  }

  return (
    <>
      <PriceRangeFilter
        key={JSON.stringify([minPrice, maxPrice, priceResetVersion])}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onApply={changePrice}
      />
      <RatingFilter minRating={minRating} onChange={changeRating} />
      {hasActiveFilters && (
        <button type="button" className="btn btn-outline btn-primary btn-sm w-full" onClick={resetFilters}>
          Đặt lại bộ lọc
        </button>
      )}
    </>
  );
}
