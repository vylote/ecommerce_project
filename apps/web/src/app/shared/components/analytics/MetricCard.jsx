const tones = {
  primary: {
    surface: "border-base-300 bg-base-200", compactSurface: "border-base-300 bg-base-200",
    title: "text-base-content", icon: "bg-primary/10", value: "text-secondary", detail: "text-base-content/75",
  },
  amber: {
    surface: "border-amber-100 bg-amber-50/60", compactSurface: "border-amber-100 bg-amber-50/50",
    title: "text-amber-800", icon: "bg-amber-100", value: "text-amber-700", detail: "text-amber-600",
  },
  blue: {
    surface: "border-blue-100 bg-blue-50/60", compactSurface: "border-blue-100 bg-blue-50/50",
    title: "text-blue-800", icon: "bg-blue-100", value: "text-blue-700", detail: "text-blue-600",
  },
  emerald: {
    surface: "border-emerald-100 bg-emerald-50/60", compactSurface: "border-emerald-100 bg-emerald-50/50",
    title: "text-emerald-800", icon: "bg-emerald-100", value: "text-emerald-700", detail: "text-emerald-600",
  },
  orange: {
    surface: "border-orange-100 bg-orange-50/60", compactSurface: "border-orange-100 bg-orange-50/50",
    title: "text-orange-800", icon: "bg-orange-100", value: "text-[#ee4d2d]", detail: "text-orange-600",
  },
  purple: {
    surface: "border-purple-100 bg-purple-50/60", compactSurface: "border-purple-100 bg-purple-50/50",
    title: "text-purple-800", icon: "bg-purple-100", value: "text-purple-700", detail: "text-purple-600",
  },
};

export default function MetricCard({ tone, compact, title, icon, value, wrapValue, children }) {
  const colors = tones[tone];
  return (
    <div className={`border rounded-xl flex flex-col justify-between ${compact ? colors.compactSurface : colors.surface} ${compact ? "p-4" : "p-5"}`}>
      <div className="flex justify-between items-start">
        <span className={`text-xs uppercase tracking-wider ${colors.title} ${compact ? "font-semibold" : "font-bold"}`}>{title}</span>
        <span className={`rounded-lg ${colors.icon} ${colors.value} ${compact ? "p-1.5" : "p-2"}`}>{icon}</span>
      </div>
      <div className="mt-3">
        <div className={`font-black ${colors.value} ${compact ? "text-xl lg:text-2xl" : "text-2xl"} ${wrapValue ? "" : "truncate"}`}>{value}</div>
        <div className={`mt-1 flex items-center gap-1 font-medium ${colors.detail} ${compact ? "text-[11px]" : "text-xs"}`}>{children}</div>
      </div>
    </div>
  );
}
