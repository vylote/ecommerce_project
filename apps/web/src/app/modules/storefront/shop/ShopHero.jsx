import { Link } from "react-router-dom";
import { useI18n } from "../../../../i18n";
import ProductImage from "../../../shared/components/ProductImage";
import getDisplayImage from "../../../entities/product/getDisplayImage";

function ShopLogo({ name, logoUrl }) {
  const initials = name.trim().split(/\s+/u).slice(0, 2).map((word) => [...word][0]).join("").toUpperCase();

  return (
    <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-base-100 text-base font-bold text-secondary ring-1 ring-white/20 sm:size-14">
      <span aria-hidden="true">{initials}</span>
      {logoUrl && (
        <img
          src={logoUrl}
          alt=""
          className="absolute inset-0 size-full bg-base-100 object-cover"
          onError={(event) => { event.currentTarget.hidden = true; }}
        />
      )}
    </div>
  );
}

export function ShopFeaturedProducts({ products }) {
  const { t } = useI18n();

  return (
    <section aria-labelledby="shop-featured-title" className="space-y-2">
      <h2 id="shop-featured-title" className="text-sm font-semibold">{t("shop.featured_products")}</h2>
      <ul className="grid gap-2 sm:grid-cols-3">
        {products.map((product) => (
          <li key={product.id} className="min-w-0">
            <Link to={`/product/${product.id}`} className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 p-2 text-sm hover:border-primary hover:text-secondary">
              <ProductImage src={getDisplayImage(product)} alt="" className="size-10 shrink-0 rounded bg-base-200 object-cover" />
              <span className="min-w-0 truncate">{product.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ShopHero({ shop, productCount }) {
  const { t, lang } = useI18n();
  const locale = lang === "en" ? "en-GB" : "vi-VN";
  const joined = shop.createdAt ? new Date(shop.createdAt) : null;
  const stats = [
    { key: "shop.products", value: Number.isFinite(productCount) ? productCount.toLocaleString(locale) : null },
    { key: "shop.rating", value: shop.rating > 0 ? `${shop.rating.toLocaleString(locale, { maximumFractionDigits: 1 })}/5` : t("shop.unrated") },
    { key: "shop.joined", value: joined && !Number.isNaN(joined.getTime())
      ? joined.toLocaleDateString(locale, { month: "short", year: "numeric" })
      : null },
  ];

  return (
    <header className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-[minmax(0,2fr)_minmax(0,5fr)]">
      <div className="flex min-w-0 items-center gap-3 bg-gradient-to-r from-secondary to-primary px-4 py-4 text-white sm:px-5">
        <ShopLogo name={shop.name} logoUrl={shop.logoUrl} />
        <h1 className="min-w-0 break-words text-xl font-bold leading-tight sm:text-2xl">{shop.name}</h1>
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-3 px-4 py-3 sm:px-5">
        <dl className="flex flex-wrap gap-x-8 gap-y-2 sm:gap-x-10">
          {stats.filter(({ value }) => value !== null).map(({ key, value }) => (
            <div key={key}>
              <dt className="text-xs text-base-content/65">{t(key)}</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-secondary">{value}</dd>
            </div>
          ))}
        </dl>
        {(shop.description || shop.address) && (
          <div className="flex flex-wrap items-start gap-x-4 gap-y-1 border-t border-base-300 pt-2 text-xs leading-5 text-base-content/75">
            {shop.description && <p className="min-w-0 break-words">{shop.description}</p>}
            {shop.address && <p className="min-w-0 break-words text-base-content/60">{shop.address}</p>}
          </div>
        )}
      </div>
    </header>
  );
}
