import { Link } from "react-router-dom";
import ProductImage from "../../../shared/components/ProductImage";
import { useI18n } from "../../../shared/i18n";
import getDisplayImage from "../getDisplayImage";

function DiscoveryProductCard({ product, showPriceRange }) {
  const { t } = useI18n();
  const { minPrice, maxPrice, price, averageRating, soldCount } = product;
  const hasRange = showPriceRange && minPrice && maxPrice && minPrice !== maxPrice;
  const formatPrice = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

  return (
    <Link
      to={`/product/${product.id}`}
      className="card bg-base-100 rounded-xl border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all overflow-hidden group cursor-pointer flex flex-col"
    >
      <figure className="relative aspect-square shrink-0 overflow-hidden bg-base-200">
        <ProductImage
          src={getDisplayImage(product)}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </figure>
      <div className="card-body flex flex-1 flex-col justify-between gap-2 p-3">
        <h4 className="line-clamp-2 text-sm font-medium leading-tight text-base-content">{product.name}</h4>
        <div className="mt-auto space-y-1.5">
          <div className="text-base font-bold text-primary">
            {hasRange ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}` : formatPrice(price)}
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-warning">{Number(averageRating || 0).toFixed(1)} sao</span>
            <span className="text-base-content/60">{t("home.sold")} {soldCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DiscoveryProductGrid({ products, loading = false, placeholderCount = 12, showPriceRange = false }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6" aria-busy={loading}>
      {loading
        ? Array.from({ length: placeholderCount }, (_, index) => (
            <div key={index} className="card rounded-xl border border-base-300 bg-base-100 p-3 shadow-sm" aria-hidden="true">
              <div className="skeleton mb-3 aspect-square w-full rounded-lg" />
              <div className="skeleton mb-2 h-4 w-full" />
              <div className="skeleton mb-4 h-4 w-2/3" />
              <div className="skeleton h-5 w-1/2" />
            </div>
          ))
        : products.map((product) => (
            <DiscoveryProductCard key={product.id} product={product} showPriceRange={showPriceRange} />
          ))}
    </div>
  );
}
