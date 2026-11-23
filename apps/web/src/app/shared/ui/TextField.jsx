import { useId } from "react";

export default function TextField({
  id,
  label,
  labelAction,
  trailing,
  compact = false,
  ...inputProps
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const padding = compact ? "py-2" : "py-3";

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="block text-sm font-medium">{label}</label>
        {labelAction}
      </div>
      <div className="relative">
        <input
          {...inputProps}
          id={inputId}
          className={`w-full rounded-lg border border-secondary/25 bg-base-100 pl-3 text-sm outline-none transition-colors placeholder:text-base-content/40 hover:border-secondary/40 focus:border-primary focus:ring-2 focus:ring-primary/15 ${padding} ${trailing ? "pr-20" : "pr-3"}`}
        />
        {trailing}
      </div>
    </div>
  );
}
