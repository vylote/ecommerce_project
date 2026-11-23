import PriceSortSelect from "./PriceSortSelect";

export default function CatalogSortControls({ defaultSort, defaultLabel, sortBy, order, onSort }) {
  const options = [
    { value: defaultSort, label: defaultLabel },
    { value: "createdAt", label: "Mới Nhất" },
    { value: "soldCount", label: "Bán Chạy" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5 text-sm">
      <span className="mr-2 text-base-content/70">Sắp xếp theo</span>
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={sortBy === value}
          className={`btn btn-sm ${sortBy === value ? "btn-primary text-white" : "border-transparent bg-base-100 font-normal"}`}
          onClick={() => onSort(value, "desc")}
        >
          {label}
        </button>
      ))}
      <PriceSortSelect active={sortBy === "price"} order={order} onChange={(value) => onSort("price", value)} />
    </div>
  );
}
