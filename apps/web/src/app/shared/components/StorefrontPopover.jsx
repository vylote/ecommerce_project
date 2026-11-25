export default function StorefrontPopover({ id, className, children }) {
  return (
    <div
      id={id}
      className={`absolute right-0 top-full z-50 mt-2 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-lg border border-base-300 bg-base-100 text-left text-base-content shadow-lg ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
