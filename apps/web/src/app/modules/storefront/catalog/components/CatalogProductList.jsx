import Pagination from "../../../../shared/components/Pagination";
import CatalogPageStepper from "./CatalogPageStepper";
import CatalogResults from "./CatalogResults";
import CatalogSortControls from "./CatalogSortControls";

export default function CatalogProductList({
  defaultSort,
  defaultLabel,
  loading,
  products,
  pageInfo,
  query,
}) {
  const { page, sortBy, order, changePage, changeSort } = query;

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= pageInfo.totalPages) changePage(newPage);
  }

  return (
    <>
      <div className="bg-base-200/50 p-3 rounded-sm flex items-center justify-between mb-4">
        <CatalogSortControls
          defaultSort={defaultSort}
          defaultLabel={defaultLabel}
          sortBy={sortBy}
          order={order}
          onSort={changeSort}
        />
        <CatalogPageStepper
          page={page}
          currentPage={pageInfo.currentPage}
          totalPages={pageInfo.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      <CatalogResults loading={loading} products={products} />
      {!loading && products.length > 0 && pageInfo.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pageInfo.totalPages}
          onPageChange={handlePageChange}
          className="mt-10 mb-8 !justify-center"
        />
      )}
    </>
  );
}
