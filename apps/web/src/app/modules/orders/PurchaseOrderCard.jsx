import { ChevronDown, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "../../../i18n";
import ProductImage from "../../shared/components/ProductImage";
import formatCurrency from "../../shared/utils/formatCurrency";

function parseDeliveryAddress(snapshot) {
  if (!snapshot) return null;
  try {
    const address = JSON.parse(snapshot);
    if (!address || typeof address !== "object") return null;
    return {
      recipient: [address.receiverName, address.phone].filter(Boolean).join(" · "),
      location: [address.street, address.ward, address.district, address.province].filter(Boolean).join(", "),
    };
  } catch {
    return { location: snapshot };
  }
}

function OrderDetails({ order }) {
  const { t } = useI18n();
  const address = parseDeliveryAddress(order.addressSnapshot);
  const method = order.paymentMethod && t(`order.payment_method.${order.paymentMethod}`, order.paymentMethod);
  const status = order.paymentStatus && t(`order.payment_status.${order.paymentStatus}`, order.paymentStatus);

  return (
    <details className="group [&_summary::-webkit-details-marker]:hidden">
      <summary className="btn btn-outline btn-secondary btn-sm flex w-fit list-none items-center gap-1.5">
        {t("order.details")}
        <ChevronDown size={14} className="transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <dl className="mt-3 grid gap-x-6 gap-y-3 rounded-xl border border-base-300 bg-base-100 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold">{t("order.payment")}</dt>
          <dd className="mt-1 text-base-content/70">
            {[method, status].filter(Boolean).join(" · ") || t("order.payment_unavailable")}
          </dd>
        </div>
        {address?.location && (
          <div>
            <dt className="font-semibold">{t("order.delivery_address")}</dt>
            <dd className="mt-1 break-words text-base-content/70">
              {address.recipient && <span className="block">{address.recipient}</span>}
              {address.location}
            </dd>
          </div>
        )}
        {order.note && (
          <div className="sm:col-span-2">
            <dt className="font-semibold">{t("order.note")}</dt>
            <dd className="mt-1 whitespace-pre-line break-words text-base-content/70">{order.note}</dd>
          </div>
        )}
      </dl>
    </details>
  );
}

export default function PurchaseOrderCard({ order, statusLabel, processing, onCancel, onComplete, onReview }) {
  const { t, lang } = useI18n();
  const date = order.createdAt ? new Date(order.createdAt) : null;
  const placedAt = date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(lang === "en" ? "en-GB" : "vi-VN")
    : null;
  const repurchaseProduct = order.items?.find((item) => item.productId);

  return (
    <article className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h2 className="break-words text-sm font-bold">{order.shopName || `#${order.id}`}</h2>
            {order.shopId && (
              <Link to={`/shop/${order.shopId}`} className="inline-flex items-center gap-1 rounded-sm border border-base-300 px-2 py-1 text-xs text-secondary hover:bg-base-200">
                <Store size={13} aria-hidden="true" /> {t("order.view_shop")}
              </Link>
            )}
          </div>
          <p className="mt-1 text-xs text-base-content/65">
            {t("order.order_number")} #{order.id}{placedAt ? ` · ${placedAt}` : ""}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.status === "CANCELLED" ? "bg-base-200 text-base-content/70" : "bg-base-200 text-secondary"}`}>
          {statusLabel}
        </span>
      </header>

      <ul className="divide-y divide-base-300 px-4 sm:px-5">
        {order.items?.map((item) => {
          const ItemRow = item.productId ? Link : "div";
          const linkProps = item.productId ? { to: `/product/${item.productId}` } : {};

          return (
            <li key={item.id}>
              <ItemRow {...linkProps} className="group flex items-center gap-3 py-3.5 sm:gap-4">
                <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-base-200 sm:size-[4.5rem]">
                  <ProductImage src={item.productImageUrl} alt="" className="size-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="line-clamp-2 font-medium group-hover:text-secondary">{item.productName}</p>
                  {item.variantName && <p className="mt-1 break-words text-xs text-base-content/65">{t("order.variant")}: {item.variantName}</p>}
                  <p className="mt-1 text-xs text-base-content/65">×{item.quantity}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">{formatCurrency(item.productPrice)}</span>
              </ItemRow>
            </li>
          );
        })}
      </ul>

      <footer className="space-y-3 border-t border-base-300 bg-base-200/55 px-4 py-4 sm:px-5">
        <p className="flex flex-wrap items-baseline justify-end gap-x-2 text-sm">
          <span>{t("order.total_amount")}</span>
          <strong className="text-xl tabular-nums text-secondary">{formatCurrency(order.totalAmount)}</strong>
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between">
          <OrderDetails order={order} />
          <div className="flex flex-wrap justify-end gap-2">
            {order.status === "PENDING" && (
              <button type="button" onClick={() => onCancel(order.id)} disabled={processing} className="btn btn-outline btn-sm">
                {t("order.cancel_order")}
              </button>
            )}
            {order.status === "SHIPPING" && (
              <button type="button" onClick={() => onComplete(order.id)} disabled={processing} className="btn btn-secondary btn-sm">
                {t("order.received_order")}
              </button>
            )}
            {order.status === "COMPLETED" && (
              <button type="button" onClick={() => onReview(order)} disabled={order.reviewed} className="btn btn-secondary btn-sm">
                {order.reviewed ? t("order.rated") : t("order.rate")}
              </button>
            )}
            {order.status === "CANCELLED" && repurchaseProduct && (
              <Link to={`/product/${repurchaseProduct.productId}`} className="btn btn-secondary btn-sm">
                {t("order.repurchase")}
              </Link>
            )}
          </div>
        </div>
      </footer>
    </article>
  );
}
