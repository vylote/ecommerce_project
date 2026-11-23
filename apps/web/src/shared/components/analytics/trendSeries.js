const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function formatAnalyticsCurrency(value) {
  return currencyFormatter.format(value || 0);
}

export function formatTrendTick(value, currency) {
  if (!currency) return Number.isInteger(value) ? value : "";
  if (value >= 1000000) return `${value / 1000000}tr`;
  if (value >= 1000) return `${value / 1000}k`;
  return value;
}

export function makeTrendDataset(context, timeline, { type, key, label, tooltipLabel, color, opacity = "40" }) {
  const data = timeline.map((item) => Number(item[key] || 0));
  if (type === "bar") {
    return { type, label, data, backgroundColor: color, borderRadius: 6 };
  }

  const gradient = context.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, color + opacity);
  gradient.addColorStop(1, color + "00");

  return {
    type,
    label,
    tooltipLabel,
    data,
    borderColor: color,
    backgroundColor: gradient,
    borderWidth: 2.5,
    tension: 0.35,
    fill: true,
    pointBackgroundColor: color,
    pointBorderColor: "#ffffff",
    pointBorderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6,
    yAxisID: "y",
  };
}
