import CatalogProductCard from "../../../../entities/product/components/CatalogProductCard";

const grid = "grid grid-cols-5 gap-2.5";

export default function CatalogResults({ loading, products }) {
  if (loading) {
    return (
      <div className={grid} aria-busy="true" aria-label="Đang tải sản phẩm">
        {Array.from({ length: 25 }, (_, index) => (
          <div key={index} className="border border-base-200 bg-base-100 p-2" aria-hidden="true">
            <div className="skeleton mb-2 aspect-square w-full rounded-sm" />
            <div className="skeleton mb-2 h-3 w-full" />
            <div className="skeleton h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <p className="border border-base-200 bg-base-100 py-16 text-center text-base-content/60 shadow-sm">
        Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
      </p>
    );
  }

  return (
    <div className={grid}>
      {products.map((product) => <CatalogProductCard key={product.id} product={product} />)}
    </div>
  );
}
