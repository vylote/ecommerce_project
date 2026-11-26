const periods = [
  { label: "7 ngày qua", period: "DAY", range: 7 },
  { label: "30 ngày qua", period: "DAY", range: 30 },
  { label: "Theo Tuần (8 tuần)", period: "WEEK", range: 8 },
  { label: "Theo Tháng (12 tháng)", period: "MONTH", range: 12 },
  { label: "Theo Năm (3 năm)", period: "YEAR", range: 3 },
];

const activeStyles = {
  primary: "bg-primary text-primary-content shadow-sm",
  blue: "bg-blue-600 text-white shadow-sm",
  emerald: "bg-emerald-600 text-white shadow-sm",
};

export default function AnalyticsPeriodFilter({ period, range, onChange, tone }) {
  return (
    <div role="group" aria-label="Chu kỳ thống kê" className="flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 p-1.5">
      {periods.map(({ label, period: optionPeriod, range: optionRange }) => {
        const active = period === optionPeriod && range === optionRange;
        return (
          <button
            key={label}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (!active) onChange(optionPeriod, optionRange);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${active ? activeStyles[tone] : "text-gray-600 hover:bg-white hover:text-gray-900"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
