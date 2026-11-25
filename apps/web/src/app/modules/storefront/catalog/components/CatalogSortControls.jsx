import { useI18n } from "../../../../../i18n";
import PriceSortSelect from "./PriceSortSelect";

export default function CatalogSortControls({ defaultSort, defaultLabel, sortBy, order, onSort }) {
  const { t } = useI18n();
  const options = [
    { value: defaultSort, label: defaultLabel },
    { value: "createdAt", label: t("catalog.newest") },
    { value: "soldCount", label: t("catalog.best_selling") },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5 text-sm">
      <span className="mr-2 text-base-content/70">{t("catalog.sort_by")}</span>
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={sortBy === value}
          className={`btn btn-sm ${sortBy === value ? "btn-secondary" : "border-transparent bg-base-100 font-normal"}`}
          onClick={() => onSort(value, "desc")}
        >
          {label}
        </button>
      ))}
      <PriceSortSelect active={sortBy === "price"} order={order} onChange={(value) => onSort("price", value)} />
    </div>
  );
}
