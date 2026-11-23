export default function ShopCategoryChoices({ categories, selectedIds, loading, onToggle, className = "" }) {
  return (
    <div role="group" aria-label="Ngành hàng kinh doanh" className={`flex flex-wrap gap-2 ${className}`}>
      {loading ? (
        <p role="status" className="text-sm text-base-content/60">Đang tải...</p>
      ) : categories.map(({ id, name }) => {
        const selected = selectedIds.includes(id);
        return (
          <button
            key={id}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggle(id)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${selected ? "border-green-600 bg-green-600 text-white" : "border-base-300 bg-base-100 text-base-content hover:border-primary hover:text-secondary"}`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
