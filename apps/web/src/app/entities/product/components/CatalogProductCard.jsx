import { Link } from "react-router-dom";
import { useI18n } from "../../../../i18n";
import ProductImage from "../../../shared/components/ProductImage";
import getDisplayImage from "../getDisplayImage";

export default function CatalogProductCard({ product }) {
  const { t, lang } = useI18n();
  const locale = lang === "en" ? "en-GB" : "vi-VN";
  const rating = product.averageRating || product.rating || 0;
  const soldCount = product.soldCount ?? 0;
  const soldLabel = soldCount >= 1000
    ? `${(soldCount / 1000).toLocaleString(locale, { maximumFractionDigits: 1 })}k`
    : soldCount.toLocaleString(locale);

  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-base-100 border border-transparent hover:border-primary shadow-[0_1px_1px_0_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-[1px] transition-all flex flex-col group relative pb-2"
    >
      <figure className="relative aspect-square bg-base-200 w-full overflow-hidden shrink-0">
        <ProductImage
            src={getDisplayImage(product)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
      </figure>

      <div className="p-2 flex flex-col flex-1">
        <h4 className="text-xs text-base-content line-clamp-2 min-h-[2.5rem] leading-[1.25rem]">
          {product.name}
        </h4>

        <div className="mt-auto pt-2">
          <div className="text-secondary font-medium text-sm mb-1">
            {(product.price ?? 0).toLocaleString(locale, { style: "currency", currency: "VND" })}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-secondary text-[10px]">
              <span>
                {t("catalog.product_rating").replace("{rating}", rating.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }))}
              </span>
            </div>
            <span className="text-[10px] text-base-content/60">
              {t("catalog.sold_count").replace("{count}", soldLabel)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
