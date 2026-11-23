export default function SearchField({ value, onChange, placeholder, onClear, className = "" }) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <input
        type="text"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-lg border border-base-300 bg-base-100 py-2 pl-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 ${onClear && value ? "pr-14" : "pr-3"}`}
      />
      {onClear && value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Xóa nội dung tìm kiếm"
          className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-secondary hover:underline"
        >
          Xóa
        </button>
      )}
    </div>
  );
}
