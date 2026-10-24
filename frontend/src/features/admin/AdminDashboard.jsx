import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../shared/utils/api";
import toast from "react-hot-toast";
import Chart from "chart.js/auto";
import {
  TrendingUp,
  DollarSign,
  Percent,
  Users,
  Store,
  Package,
  ShoppingBag,
  BarChart3,
  PieChart,
  RefreshCw,
  FolderTree,
  KeyRound,
  Settings2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function AdminDashboard() {
  const chartCanvasRef = useRef(null);
  const donutCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const donutInstanceRef = useRef(null);

  // Bộ lọc thời gian: DAY, WEEK, MONTH, YEAR
  const [filterPeriod, setFilterPeriod] = useState("DAY");
  const [filterRange, setFilterRange] = useState(7);
  // Góc nhìn biểu đồ: 'financial' (GMV & Hoa hồng) | 'orders' (Số lượng đơn hàng)
  const [activeChartMetric, setActiveChartMetric] = useState("financial");

  // Dữ liệu phân tích toàn sàn
  const [analytics, setAnalytics] = useState({
    totalGrossRevenue: 0,
    totalCommissionRevenue: 0,
    totalNetRevenue: 0,
    pendingGrossRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    totalOrdersAll: 0,
    totalUsers: 0,
    totalShops: 0,
    totalProducts: 0,
    statusBreakdown: {},
    timeline: [],
  });
  const [loading, setLoading] = useState(false);

  // Format tiền tệ VNĐ
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  const fetchAnalytics = async (period = filterPeriod, range = filterRange) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/commission/stats/admin/analytics?period=${period}&range=${range}`
      );
      if (response.data?.result) {
        setAnalytics(response.data.result);
      }
    } catch (error) {
      console.error("Admin Analytics Error:", error);
      toast.error("Không thể tải thống kê sàn giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(filterPeriod, filterRange);
  }, [filterPeriod, filterRange]);

  // Vẽ biểu đồ chính (Line / Area kép hoặc Bar)
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = (analytics.timeline || []).map((t) => t.label || t.date);
    const grossData = (analytics.timeline || []).map((t) => Number(t.grossRevenue || 0));
    const commData = (analytics.timeline || []).map((t) => Number(t.commissionRevenue || 0));
    const completedOrders = (analytics.timeline || []).map((t) => Number(t.orderCount || 0));
    const totalOrders = (analytics.timeline || []).map((t) => Number(t.totalCount || 0));

    const ctx = canvas.getContext("2d");

    let datasets = [];

    if (activeChartMetric === "financial") {
      // Gradient cho GMV Sàn (Xanh dương)
      const gradGMV = ctx.createLinearGradient(0, 0, 0, 300);
      gradGMV.addColorStop(0, "rgba(37, 99, 235, 0.25)");
      gradGMV.addColorStop(1, "rgba(37, 99, 235, 0.0)");

      // Gradient cho Hoa hồng sàn (Cam Shopee)
      const gradComm = ctx.createLinearGradient(0, 0, 0, 300);
      gradComm.addColorStop(0, "rgba(238, 77, 45, 0.25)");
      gradComm.addColorStop(1, "rgba(238, 77, 45, 0.0)");

      datasets = [
        {
          type: "line",
          label: "Tổng GMV Sàn (₫)",
          data: grossData,
          borderColor: "#2563eb",
          backgroundColor: gradGMV,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: "y",
        },
        {
          type: "line",
          label: "Hoa Hồng Thu Được (₫)",
          data: commData,
          borderColor: "#ee4d2d",
          backgroundColor: gradComm,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: "#ee4d2d",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: "y",
        },
      ];
    } else {
      // Biểu đồ cột: Số đơn hàng toàn sàn
      datasets = [
        {
          type: "bar",
          label: "Đơn hoàn thành",
          data: completedOrders,
          backgroundColor: "rgba(37, 99, 235, 0.85)",
          borderRadius: 6,
        },
        {
          type: "bar",
          label: "Tổng đơn phát sinh",
          data: totalOrders,
          backgroundColor: "rgba(148, 163, 184, 0.5)",
          borderRadius: 6,
        },
      ];
    }

    chartInstanceRef.current = new Chart(ctx, {
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
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
                if (activeChartMetric === "financial") {
                  return ` ${context.dataset.label}: ${formatCurrency(context.raw)}`;
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
                if (activeChartMetric === "financial") {
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

  // Vẽ biểu đồ Donut trạng thái đơn hàng toàn sàn
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

    return () => {
      if (donutInstanceRef.current) {
        donutInstanceRef.current.destroy();
      }
    };
  }, [analytics.statusBreakdown]);

  // Bộ lọc nhanh theo chu kỳ
  const quickFilters = [
    { label: "7 ngày qua", period: "DAY", range: 7 },
    { label: "30 ngày qua", period: "DAY", range: 30 },
    { label: "Theo Tuần (8 tuần)", period: "WEEK", range: 8 },
    { label: "Theo Tháng (12 tháng)", period: "MONTH", range: 12 },
    { label: "Theo Năm (3 năm)", period: "YEAR", range: 3 },
  ];

  const completionRate = useMemo(() => {
    if (!analytics.totalOrdersAll || analytics.totalOrdersAll === 0) return 0;
    return Math.round((analytics.totalOrders / analytics.totalOrdersAll) * 100);
  }, [analytics]);

  return (
    <div className="w-full animate-fade-in flex flex-col gap-6">
      {/* 1. WELCOME & PORTAL HEADER */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Shopee Clone • Trung Tâm Quản Trị Hệ Thống</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Thống Kê Toàn Cảnh Sàn Giao Dịch
          </h2>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            Theo dõi tổng giá trị giao dịch (GMV), doanh thu hoa hồng sàn, hiệu suất đơn hàng và các chỉ số kinh doanh then chốt.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => fetchAnalytics()}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-sm font-medium backdrop-blur-sm transition-all"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Cập nhật</span>
          </button>
        </div>
      </div>

      {/* 2. CHỈ SỐ NỀN TẢNG (PLATFORM STATS - 4 COUNTERS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Người dùng</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">
              {analytics.totalUsers || 0}
            </div>
          </div>
        </div>

        <Link to="/admin/shops" className="bg-white border border-gray-200 hover:border-emerald-300 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <span>Gian hàng (Shops)</span>
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">
              {analytics.totalShops || 0}
            </div>
          </div>
        </Link>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Sản phẩm niêm yết</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">
              {analytics.totalProducts || 0}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Tỷ lệ hoàn thành</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">
              {completionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* 3. KHỐI PHÂN TÍCH TÀI CHÍNH & BIỂU ĐỒ (CHÍNH) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Header Bộ lọc thời gian */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-lg">
                Hiệu Quả Kinh Doanh & Phân Tích Chu Kỳ
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Chọn chu kỳ để xem biến động doanh thu theo Ngày, Tuần, Tháng hoặc Năm
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
            {quickFilters.map((qf) => {
              const isActive = filterPeriod === qf.period && filterRange === qf.range;
              return (
                <button
                  key={qf.label}
                  onClick={() => {
                    setFilterPeriod(qf.period);
                    setFilterRange(qf.range);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }`}
                >
                  {qf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Thẻ Tài Chính Lớn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tổng GMV Sàn */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                Tổng GMV Toàn Sàn
              </span>
              <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-blue-700 truncate">
                {formatCurrency(analytics.totalGrossRevenue)}
              </div>
              <div className="text-xs text-blue-600 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Từ {analytics.totalOrders || 0} đơn hoàn tất
              </div>
            </div>
          </div>

          {/* Card 2: Tổng Hoa Hồng Thu Được */}
          <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">
                Hoa Hồng Sàn Thu Được
              </span>
              <span className="p-2 bg-orange-100 text-[#ee4d2d] rounded-lg">
                <Percent className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-[#ee4d2d] truncate">
                {formatCurrency(analytics.totalCommissionRevenue)}
              </div>
              <div className="text-xs text-orange-600 mt-1 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                Doanh thu thực sàn được hưởng
              </div>
            </div>
          </div>

          {/* Card 3: Thực Nhận Của Shop (Net) */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Thực Nhận Của Các Shop
              </span>
              <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Store className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-emerald-700 truncate">
                {formatCurrency(analytics.totalNetRevenue)}
              </div>
              <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                <span>GMV trừ đi phần hoa hồng</span>
              </div>
            </div>
          </div>

          {/* Card 4: Doanh Thu Tạm Tính (Lưu thông) */}
          <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Doanh Thu Đang Lưu Thông
              </span>
              <span className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-purple-700 truncate">
                {formatCurrency(analytics.pendingGrossRevenue)}
              </div>
              <div className="text-xs text-purple-600 mt-1 flex items-center gap-1 font-medium">
                <Truck className="w-3.5 h-3.5" />
                Các đơn đang giao / chờ lấy
              </div>
            </div>
          </div>
        </div>

        {/* KHU VỰC VẼ BIỂU ĐỒ (Dual Line Chart + Donut Status Breakdown) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Cột Trái 2/3: Biểu đồ xu hướng */}
          <div className="lg:col-span-2 border border-gray-100 bg-gray-50/50 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span>
                  {activeChartMetric === "financial"
                    ? "Đồ thị GMV Sàn & Hoa Hồng Thu Được"
                    : "Đồ thị Khối Lượng Đơn Hàng"}
                </span>
                {loading && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                )}
              </div>

              {/* Chuyển đổi góc nhìn */}
              <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setActiveChartMetric("financial")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    activeChartMetric === "financial"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Doanh thu (₫)
                </button>
                <button
                  onClick={() => setActiveChartMetric("orders")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    activeChartMetric === "orders"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Số lượng đơn
                </button>
              </div>
            </div>

            {/* Canvas Chart */}
            <div className="h-[290px] w-full relative">
              <canvas ref={chartCanvasRef}></canvas>
            </div>
          </div>

          {/* Cột Phải 1/3: Biểu đồ Donut Cơ cấu trạng thái đơn toàn sàn */}
          <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-800">
                Cơ Cấu Trạng Thái Đơn Sàn
              </span>
              <span className="text-xs text-gray-400">
                Tổng {analytics.totalOrdersAll || 0} đơn
              </span>
            </div>

            {/* Donut Canvas */}
            <div className="h-[180px] w-full relative flex items-center justify-center my-2">
              <canvas ref={donutCanvasRef}></canvas>
            </div>

            {/* Status Legend */}
            <div className="space-y-2 pt-3 border-t border-gray-200 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="text-gray-600 font-medium">Đã Hoàn Tất</span>
                </div>
                <span className="font-bold text-gray-800">
                  {analytics.statusBreakdown?.COMPLETED || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                  <span className="text-gray-600 font-medium">Đang Giao</span>
                </div>
                <span className="font-bold text-gray-800">
                  {analytics.statusBreakdown?.SHIPPING || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span className="text-gray-600 font-medium">Chờ Lấy Hàng</span>
                </div>
                <span className="font-bold text-gray-800">
                  {analytics.statusBreakdown?.CONFIRMED || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-gray-600 font-medium">Chờ Xác Nhận</span>
                </div>
                <span className="font-bold text-gray-800">
                  {analytics.statusBreakdown?.PENDING || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-gray-600 font-medium">Đã Hủy</span>
                </div>
                <span className="font-bold text-gray-800">
                  {analytics.statusBreakdown?.CANCELLED || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PHÍM TẮT QUẢN TRỊ HỆ THỐNG (QUICK ACTIONS) */}
      <div>
        <h3 className="font-bold text-gray-800 text-lg mb-4">
          Phím Tắt Quản Trị Hệ Thống
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to="/admin/shops"
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex items-start gap-3.5 group"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Store size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 group-hover:text-emerald-600 transition-colors text-sm">
                Quản lý gian hàng
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Giám sát hoạt động, khóa/mở khóa gian hàng vi phạm.
              </p>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex items-start gap-3.5 group"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-sm">
                Quản lý người dùng
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Xem danh sách khách hàng, người bán, khóa và kích hoạt tài khoản.
              </p>
            </div>
          </Link>

          <Link
            to="/admin/commissions"
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex items-start gap-3.5 group"
          >
            <div className="p-3 bg-orange-50 text-[#ee4d2d] rounded-xl group-hover:bg-[#ee4d2d] group-hover:text-white transition-colors">
              <Percent size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 group-hover:text-[#ee4d2d] transition-colors text-sm">
                Cấu hình hoa hồng
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Thiết lập mức phần trăm chiết khấu sàn cho từng danh mục.
              </p>
            </div>
          </Link>

          <Link
            to="/admin/categories"
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex items-start gap-3.5 group"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FolderTree size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 group-hover:text-emerald-600 transition-colors text-sm">
                Quản lý danh mục
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Cây phân cấp danh mục đa tầng và quản lý thông số ngành hàng.
              </p>
            </div>
          </Link>

          <Link
            to="/admin/roles"
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-purple-300 transition-all flex items-start gap-3.5 group"
          >
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <KeyRound size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors text-sm">
                Phân quyền & Role
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Quản lý nhóm quyền hạn, vai trò và phân bổ quyền cho nhân sự.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
