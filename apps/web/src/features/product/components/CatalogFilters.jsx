import PriceRangeFilter from "./PriceRangeFilter";
import RatingFilter from "./RatingFilter";

export default function CatalogFilters({ query }) {
  const { minPrice, maxPrice, minRating, changePrice, changeRating } = query;

  return (
    <>
      <PriceRangeFilter
        key={JSON.stringify([minPrice, maxPrice])}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onApply={changePrice}
      />
      <RatingFilter minRating={minRating} onChange={changeRating} />
    </>
  );
}
