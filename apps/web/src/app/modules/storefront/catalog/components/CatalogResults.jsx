import { useI18n } from "../../../../../i18n";
import CatalogProductCard from "../../../../entities/product/components/CatalogProductCard";

const grid = "grid grid-cols-5 gap-2.5";

export default function CatalogResults({
  loading,
  products,
  className = grid,
  placeholderCount = 25,
  emptyMessage,
}) {
  const { t } = useI18n();
  if (loading) {
    return (
      <div className={className} aria-busy="true" aria-label={t("catalog.loading")}>
        {Array.from({ length: placeholderCount }, (_, index) => (
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
        {emptyMessage ?? t("catalog.empty")}
      </p>
    );
  }

  return (
    <div className={className}>
      {products.map((product) => <CatalogProductCard key={product.id} product={product} />)}
    </div>
  );
}
