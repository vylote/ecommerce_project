export default function FilterTabs({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex overflow-x-auto bg-base-100 px-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className="flex-1 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-medium text-base-content/75 transition-colors hover:bg-base-200 hover:text-secondary focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-secondary aria-pressed:border-primary aria-pressed:bg-base-200 aria-pressed:font-semibold aria-pressed:text-secondary"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
