import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function OrderStatusChart({ statusBreakdown }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const statusMap = statusBreakdown || {};
    const statusLabels = [
      "Đã Hoàn Tất",
      "Đang Giao",
      "Chờ Lấy Hàng",
      "Chờ Xác Nhận",
      "Đã Hủy",
    ];
    const statusData = [
      statusMap.COMPLETED || 0,
      statusMap.SHIPPING || 0,
      statusMap.CONFIRMED || 0,
      statusMap.PENDING || 0,
      statusMap.CANCELLED || 0,
    ];

    const hasData = statusData.some((v) => v > 0);

    const ctx = canvas.getContext("2d");
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: statusLabels,
        datasets: [
          {
            data: hasData ? statusData : [1],
            backgroundColor: hasData
              ? [
                  "#16a34a", // Hoàn tất - Xanh lá
                  "#0284c7", // Đang giao - Xanh biển
                  "#8b5cf6", // Chờ lấy - Tím
                  "#f59e0b", // Chờ xác nhận - Vàng
                  "#ef4444", // Đã hủy - Đỏ
                ]
              : ["#e2e8f0"],
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

  return <canvas ref={canvasRef} />;
}
