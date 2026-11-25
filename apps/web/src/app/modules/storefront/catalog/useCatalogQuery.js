import { useSearchParams } from "react-router-dom";
import { updateCatalogSearchParams } from "./catalogSearchParams";

export default function useCatalogQuery(defaultSort) {
  const [searchParams, setSearchParams] = useSearchParams();

  function updateParams(changes) {
    setSearchParams(updateCatalogSearchParams(searchParams, changes));
  }

  return {
    keyword: searchParams.get("keyword") || "",
    page: Number.parseInt(searchParams.get("page") || "1", 10),
    sortBy: searchParams.get("sortBy") || defaultSort,
    order: searchParams.get("order") || "desc",
    minPrice: searchParams.get("minPrice"),
    maxPrice: searchParams.get("maxPrice"),
    minRating: searchParams.get("minRating"),
    changePage: (page) => updateParams({ page }),
    changeSort: (sortBy, order = "desc") => updateParams({ sortBy, order, page: 1 }),
    changePrice: (minPrice, maxPrice) => updateParams({ minPrice, maxPrice, page: 1 }),
    changeRating: (minRating) => updateParams({ minRating, page: 1 }),
    clearFilters: () => updateParams({ minPrice: null, maxPrice: null, minRating: null, page: 1 }),
  };
}
