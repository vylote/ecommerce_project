import React, { useEffect, useRef, useState, useMemo } from "react";
import api from "../../shared/utils/api";
import toast from "react-hot-toast";
import Chart from "chart.js/auto";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Truck,
  Layers,
} from "lucide-react";

export default function SellerDashboard() {
  const chartCanvasRef = useRef(null);
  const donutCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const donutInstanceRef = useRef(null);

  // Thống kê nhanh toàn bộ từ danh sách cần làm
  const [orderStats, setOrderStats] = useState({
    PENDING: 0,
    CONFIRMED: 0,
    SHIPPING: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  });

  // Bộ lọc thời gian: DAY, WEEK, MONTH, YEAR
  const [filterPeriod, setFilterPeriod] = useState("DAY");
  const [filterRange, setFilterRange] = useState(7);
  // Loại biểu đồ chính hiển thị: 'revenue' (Area Line) | 'orders' (Bar)
  const [activeChartMetric, setActiveChartMetric] = useState("revenue");

  // Dữ liệu phân tích bán hàng từ backend
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingRevenue: 0,
    totalOrdersAll: 0,
    averageOrderValue: 0,
    statusBreakdown: {},
    timeline: [],
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Format tiền tệ VNĐ
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  // Fetch dữ liệu danh sách cần làm
  const fetchStats = async () => {
    try {
      const response = await api.get("/orders/seller/dashboard/stats");
      if (response.data?.result) {
        setOrderStats(response.data.result);
      }
    } catch (error) {
      console.error("Dashboard Stats Error:", error);
    }
  };

  // Fetch dữ liệu phân tích bán hàng theo kỳ
  const fetchAnalytics = async (period = filterPeriod, range = filterRange) => {
    setLoadingAnalytics(true);
    try {
      const response = await api.get(
        `/orders/seller/dashboard/analytics?period=${period}&range=${range}`
      );
      if (response.data?.result) {
        setAnalytics(response.data.result);
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu phân tích bán hàng");
      console.error("Dashboard Analytics Error:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchAnalytics(filterPeriod, filterRange);
  }, [filterPeriod, filterRange]);

  // Vẽ biểu đồ chính (Line / Area hoặc Bar)
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = (analytics.timeline || []).map((t) => t.label || t.date);
    const revenues = (analytics.timeline || []).map((t) => Number(t.revenue || 0));
    const completedOrders = (analytics.timeline || []).map((t) => Number(t.orderCount || 0));
    const totalOrders = (analytics.timeline || []).map((t) => Number(t.totalCount || 0));

    const ctx = canvas.getContext("2d");

    let dataset = [];
    if (activeChartMetric === "revenue") {
      // Gradient cho biểu đồ doanh thu
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, "rgba(22, 163, 74, 0.35)");
      gradient.addColorStop(1, "rgba(22, 163, 74, 0.0)");

      dataset = [
        {
          type: "line",
          label: "Doanh số thực nhận (₫)",
          data: revenues,
          borderColor: "#16a34a",
          backgroundColor: gradient,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: "#16a34a",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ];
    } else {
      // Biểu đồ cột: Số đơn thành công vs Tổng số đơn
      dataset = [
        {
          type: "bar",
          label: "Đơn hoàn thành",
          data: completedOrders,
          backgroundColor: "rgba(22, 163, 74, 0.85)",
          borderRadius: 6,
        },
        {
          type: "bar",
          label: "Tổng số đơn",
          data: totalOrders,
          backgroundColor: "rgba(148, 163, 184, 0.5)",
          borderRadius: 6,
        },
      ];
    }

    chartInstanceRef.current = new Chart(ctx, {
      data: {
        labels,
        datasets: dataset,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
              label: (context) => {
                if (activeChartMetric === "revenue") {
                  return ` Doanh số: ${formatCurrency(context.raw)}`;
                }
                return ` ${context.dataset.label}: ${context.raw} đơn`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11 },
              maxRotation: 45,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(241, 245, 249, 1)" },
            ticks: {
              font: { size: 11 },
              callback: (val) => {
                if (activeChartMetric === "revenue") {
                  if (val >= 1000000) return `${val / 1000000}tr`;
                  if (val >= 1000) return `${val / 1000}k`;
                  return val;
                }
                return Number.isInteger(val) ? val : "";
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [analytics, activeChartMetric]);

  // Vẽ biểu đồ Donut: Phân bổ trạng thái đơn hàng
  useEffect(() => {
    const canvas = donutCanvasRef.current;
    if (!canvas) return;

    if (donutInstanceRef.current) {
      donutInstanceRef.current.destroy();
    }

    const statusMap = analytics.statusBreakdown || {};
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
    donutInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: statusLabels,
        datasets: [
          {
            data: hasData ? statusData : [1],
            backgroundColor: hasData
              ? [
                  "#16a34a", // Hoàn tất - Xanh ngọc
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
          legend: {
            display: false,
          },
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

    return () => {
      if (donutInstanceRef.current) {
        donutInstanceRef.current.destroy();
      }
    };
  }, [analytics.statusBreakdown]);

  // Danh mục thời gian nhanh
  const quickFilters = [
    { label: "7 ngày qua", period: "DAY", range: 7 },
    { label: "30 ngày qua", period: "DAY", range: 30 },
    { label: "Theo Tuần (8 tuần)", period: "WEEK", range: 8 },
    { label: "Theo Tháng (12 tháng)", period: "MONTH", range: 12 },
    { label: "Theo Năm (3 năm)", period: "YEAR", range: 3 },
  ];

  // Tính tỷ lệ đơn hoàn thành
  const completionRate = useMemo(() => {
    if (!analytics.totalOrdersAll || analytics.totalOrdersAll === 0) return 0;
    return Math.round((analytics.totalOrders / analytics.totalOrdersAll) * 100);
  }, [analytics]);

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* KHU VỰC CỘT CHÍNH (MAIN CONTENT) */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 w-full">
        {/* Banner Thuế & Định danh */}
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-wrap gap-3 items-center shadow-sm">
          <div className="flex-1">
            <div className="font-bold text-gray-900">
              Cập nhật thông tin thuế & định danh
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Vui lòng cập nhật trước hạn chót để tránh ảnh hưởng hoạt động bán
              hàng.
            </div>
          </div>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
            Cập nhật ngay
          </button>
        </div>

        {/* Danh sách cần làm (To-Do Grid) */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Danh sách cần làm
            </h3>
            <button
              onClick={fetchStats}
              title="Làm mới trạng thái"
              className="text-gray-400 hover:text-emerald-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              {
                num: orderStats.PENDING,
                label: "Chờ Xác Nhận",
                sub: "Đơn mới cần duyệt",
                color: "text-amber-600",
              },
              {
                num: orderStats.CONFIRMED,
                label: "Chờ Lấy Hàng",
                sub: "Chờ bưu tá lấy",
                color: "text-purple-600",
              },
              {
                num: orderStats.SHIPPING,
                label: "Đang Giao",
                sub: "Đang luân chuyển",
                color: "text-blue-600",
              },
              {
                num: orderStats.COMPLETED,
                label: "Đã Xử Lý",
                sub: "Giao thành công",
                color: "text-emerald-600",
              },
              {
                num: orderStats.CANCELLED,
                label: "Đơn Hủy",
                sub: "Đơn bị khách hủy",
                color: "text-rose-500",
              },
              {
                num: 0,
                label: "Sản phẩm tạm khóa",
                sub: "SP vi phạm / kiểm tra",
                color: "text-gray-600",
              },
              {
                num: 0,
                label: "Sản phẩm hết hàng",
                sub: "Cần bổ sung kho",
                color: "text-gray-600",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gray-50/70 hover:bg-white border border-gray-100 hover:border-emerald-200 p-3 rounded-lg flex flex-col justify-between hover:shadow-md transition-all cursor-pointer"
              >
                <div className={`font-black text-2xl ${item.color}`}>
                  {item.num}
                </div>
                <div className="mt-2">
                  <div className="text-xs font-semibold text-gray-800 truncate">
                    {item.label}
                  </div>
                  <div
                    className="text-[11px] text-gray-400 mt-0.5 truncate"
                    title={item.sub}
                  >
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PHÂN TÍCH BÁN HÀNG & BIỂU ĐỒ NÂNG CAO */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
          {/* Header & Bộ lọc thời gian */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-base">
                  Phân tích bán hàng & Hiệu quả kinh doanh
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Thống kê số liệu doanh thu thực tế và xu hướng tăng trưởng theo
                chu kỳ
              </p>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200">
              {quickFilters.map((qf) => {
                const isActive =
                  filterPeriod === qf.period && filterRange === qf.range;
                return (
                  <button
                    key={qf.label}
                    onClick={() => {
                      setFilterPeriod(qf.period);
                      setFilterRange(qf.range);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white"
                    }`}
                  >
                    {qf.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metric Cards - 4 Thẻ chỉ số kinh doanh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Doanh số thực nhận */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Doanh số hoàn tất
                </span>
                <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl lg:text-2xl font-black text-emerald-700 truncate">
                  {formatCurrency(analytics.totalRevenue)}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Từ {analytics.totalOrders} đơn giao thành công
                </div>
              </div>
            </div>

            {/* 2. Doanh thu tạm tính (Đang giao / Chờ xử lý) */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                  Doanh thu tạm tính
                </span>
                <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl lg:text-2xl font-black text-blue-700 truncate">
                  {formatCurrency(analytics.pendingRevenue)}
                </div>
                <div className="text-[11px] text-blue-600 mt-1 flex items-center gap-1 font-medium">
                  <Truck className="w-3.5 h-3.5" />
                  Đơn đang giao hoặc chờ lấy hàng
                </div>
              </div>
            </div>

            {/* 3. Giá trị trung bình đơn (AOV) */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Giá trị TB / Đơn (AOV)
                </span>
                <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl lg:text-2xl font-black text-amber-700 truncate">
                  {formatCurrency(analytics.averageOrderValue)}
                </div>
                <div className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Doanh thu trung bình mỗi đơn hoàn tất
                </div>
              </div>
            </div>

            {/* 4. Tổng số đơn hàng & Tỷ lệ thành công */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider">
                  Hiệu suất đơn hàng
                </span>
                <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                  <PieChart className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl lg:text-2xl font-black text-purple-700">
                  {analytics.totalOrdersAll} <span className="text-sm font-medium text-gray-500">đơn phát sinh</span>
                </div>
                <div className="text-[11px] text-purple-600 mt-1 flex items-center gap-1 font-medium">
                  <span>Tỷ lệ hoàn thành: <b>{completionRate}%</b></span>
                </div>
              </div>
            </div>
          </div>

          {/* VÙNG VẼ BIỂU ĐỒ KẾT HỢP (Main Trend Chart + Status Donut) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
            {/* Cột trái 2/3: Biểu đồ xu hướng (Area / Bar) */}
            <div className="lg:col-span-2 border border-gray-100 bg-gray-50/40 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <span>Xu hướng {activeChartMetric === "revenue" ? "Doanh số" : "Số lượng đơn hàng"}</span>
                  {loadingAnalytics && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  )}
                </div>

                {/* Switch Metric View */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setActiveChartMetric("revenue")}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      activeChartMetric === "revenue"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Đồ thị Doanh số (₫)
                  </button>
                  <button
                    onClick={() => setActiveChartMetric("orders")}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      activeChartMetric === "orders"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Cột Số đơn hàng
                  </button>
                </div>
              </div>

              {/* Canvas Chart */}
              <div className="h-[260px] w-full relative">
                <canvas ref={chartCanvasRef}></canvas>
              </div>
            </div>

            {/* Cột phải 1/3: Cơ cấu Trạng thái Đơn hàng (Doughnut Chart) */}
            <div className="border border-gray-100 bg-gray-50/40 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-800">
                  Cơ cấu trạng thái đơn
                </span>
                <span className="text-xs text-gray-400">
                  Tổng {analytics.totalOrdersAll || 0} đơn
                </span>
              </div>

              {/* Donut Canvas */}
              <div className="h-[170px] w-full relative flex items-center justify-center my-1">
                <canvas ref={donutCanvasRef}></canvas>
              </div>

              {/* Legend trực quan */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="text-gray-600">Đã Hoàn Tất</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {analytics.statusBreakdown?.COMPLETED || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                    <span className="text-gray-600">Đang Giao</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {analytics.statusBreakdown?.SHIPPING || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span className="text-gray-600">Chờ Lấy Hàng</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {analytics.statusBreakdown?.CONFIRMED || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-gray-600">Chờ Xác Nhận</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {analytics.statusBreakdown?.PENDING || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-gray-600">Đơn Đã Hủy</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {analytics.statusBreakdown?.CANCELLED || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KHU VỰC CỘT PHẢI (WIDGETS & MARKETING) */}
      <aside className="w-full lg:w-[320px] flex flex-col gap-4 shrink-0">
        {/* Kênh Marketing */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">Kênh Marketing</h3>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
              <div className="text-sm font-medium">Chiến dịch Mega Sale</div>
              <div className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                Đang diễn ra
              </div>
            </div>
            <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
              <div className="text-sm font-medium">Ưu đãi vận chuyển</div>
              <div className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                Đã kích hoạt
              </div>
            </div>
            <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
              <div className="text-sm font-medium">Quảng cáo Shop</div>
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                Tạo mới
              </div>
            </div>
          </div>
          <h4 className="font-bold text-gray-700 text-sm mb-2">
            Hành động nhanh
          </h4>
          <div className="flex flex-wrap gap-2">
            <button className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              Tạo sản phẩm mới
            </button>
            <button className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              Tạo mã giảm giá
            </button>
          </div>
        </div>

        {/* Thông báo & Cập nhật */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">Thông báo & Cập nhật</h3>
          <div className="space-y-3">
            <div className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="text-sm font-bold text-gray-800">
                Ra mắt chương trình Livestream mới
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Tham gia để nhận trợ giá lên tới 30% cho gian hàng.
              </div>
            </div>
            <div className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="text-sm font-bold text-emerald-700">
                Đồng bộ hóa tồn kho tự động
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Tính năng kiểm soát tồn kho biến thể đã chính thức hoạt động.
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
