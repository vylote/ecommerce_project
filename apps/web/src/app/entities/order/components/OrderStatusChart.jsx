import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";


const orderStatuses = [
  { key: "COMPLETED", label: "Đã Hoàn Tất", color: "#16a34a" },
  { key: "SHIPPING", label: "Đang Giao", color: "#0284c7" },
  { key: "CONFIRMED", label: "Chờ Lấy Hàng", color: "#8b5cf6" },
  { key: "PENDING", label: "Chờ Xác Nhận", color: "#f59e0b" },
  { key: "CANCELLED", label: "Đã Hủy", color: "#ef4444" },
];

function getStatusCount(statusBreakdown, key) {
  return Number(statusBreakdown?.[key] || 0);
}

export function OrderStatusLegend({ statusBreakdown }) {
  return (
    <dl className="space-y-2 border-t border-gray-200 pt-3 text-xs">
      {orderStatuses.map(({ key, label, color }) => (
        <div key={key} className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-2 font-medium text-gray-600">
            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </dt>
          <dd className="font-bold text-gray-800">{getStatusCount(statusBreakdown, key)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function OrderStatusChart({ statusBreakdown }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const statusData = orderStatuses.map(({ key }) => getStatusCount(statusBreakdown, key));
    const hasData = statusData.some((v) => v > 0);

    const ctx = canvas.getContext("2d");
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: hasData ? orderStatuses.map(({ label }) => label) : ["Chưa có đơn hàng"],
        datasets: [
          {
            data: hasData ? statusData : [1],
            backgroundColor: hasData ? orderStatuses.map(({ color }) => color) : ["#e2e8f0"],
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: hasData,
            callbacks: {
              label: (context) => {
                const total = statusData.reduce((a, b) => a + b, 0);
                const percent = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${context.raw} đơn (${percent}%)`;
              },
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [statusBreakdown]);

  return <canvas ref={canvasRef} role="img" aria-label="Cơ cấu trạng thái đơn hàng" />;
}
