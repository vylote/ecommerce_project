import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { formatAnalyticsCurrency, formatTrendTick, makeTrendDataset } from "./trendSeries";

export default function AnalyticsTrendChart({ timeline, series, format, tooltipInteraction }) {
  const canvasRef = useRef(null);
  const currency = format === "currency";

  useEffect(() => {
    if (!timeline?.length) return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    const chart = new Chart(context, {
      data: {
        labels: timeline.map(({ label, date }) => label || date),
        datasets: series.map((item) => makeTrendDataset(context, timeline, item)),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: tooltipInteraction,
        plugins: {
          legend: {
            position: "top",
            labels: {
              font: { size: 12, family: "inherit", weight: "500" },
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            padding: 12,
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            titleFont: { size: 13, weight: "bold" },
            bodyFont: { size: 12 },
            callbacks: {
              label: ({ dataset, raw }) => {
                const value = currency ? formatAnalyticsCurrency(raw) : `${raw} đơn`;
                return ` ${dataset.tooltipLabel ?? dataset.label}: ${value}`;
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 45 } },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(241, 245, 249, 1)" },
            ticks: { font: { size: 11 }, callback: (value) => formatTrendTick(value, currency) },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [currency, series, timeline, tooltipInteraction]);

  if (!timeline?.length) {
    return <p className="grid h-full place-items-center text-sm text-gray-500">Chưa có dữ liệu theo chu kỳ này</p>;
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={currency ? "Biểu đồ doanh thu theo thời gian" : "Biểu đồ số đơn theo thời gian"}
    />
  );
}
