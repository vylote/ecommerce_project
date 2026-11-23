import AnalyticsPeriodFilter from "../../shared/components/analytics/AnalyticsPeriodFilter";
import AnalyticsTrendChart from "../../shared/components/analytics/AnalyticsTrendChart";
import formatCurrency from "../../shared/utils/formatCurrency";
import useDashboardAnalytics from "../../shared/hooks/useDashboardAnalytics";
import MetricCard from "../../shared/components/analytics/MetricCard";
import OrderStatusSummary from "../order/components/OrderStatusSummary";
import { useEffect, useState } from "react";
import api from "../../shared/utils/api";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  BarChart3,
  PieChart,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  Layers,
} from "lucide-react";

const trendSeries = {
  revenue: [
    { type: "line", key: "revenue", label: "Doanh số thực nhận (₫)", tooltipLabel: "Doanh số", color: "#16a34a", opacity: "59" },
  ],
  orders: [
    { type: "bar", key: "orderCount", label: "Đơn hoàn thành", color: "rgba(22, 163, 74, 0.85)" },
    { type: "bar", key: "totalCount", label: "Tổng số đơn", color: "rgba(148, 163, 184, 0.5)" },
  ],
};

export default function SellerDashboard() {

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
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const [statsVersion, setStatsVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStats() {
      try {
        const response = await api.get("/orders/seller/dashboard/stats", { signal: controller.signal });
        if (!controller.signal.aborted && response.data?.result) {
          setOrderStats(response.data.result);
        }
      } catch (error) {
        if (!controller.signal.aborted) console.error("Dashboard Stats Error:", error);
      }
    }

    fetchStats();
    return () => controller.abort();
  }, [statsVersion]);

  const completionRate = useDashboardAnalytics({
    endpoint: "/orders/seller/dashboard/analytics",
    errorMessage: "Không thể tải dữ liệu phân tích bán hàng",
    period: filterPeriod,
    range: filterRange,
    analytics,
    setAnalytics,
    setLoading: setLoadingAnalytics,
  });

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
              onClick={() => setStatsVersion((version) => version + 1)}
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

            <AnalyticsPeriodFilter
              period={filterPeriod}
              range={filterRange}
              onChange={(period, range) => {
                setLoadingAnalytics(true);
                setFilterPeriod(period);
                setFilterRange(range);
              }}
              tone="emerald"
            />
          </div>

          {/* Metric Cards - 4 Thẻ chỉ số kinh doanh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Doanh số thực nhận */}
            <MetricCard
              tone="emerald"
              compact
              title="Doanh số hoàn tất"
              icon={<DollarSign className="w-4 h-4" />}
              value={formatCurrency(analytics.totalRevenue)}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Từ {analytics.totalOrders} đơn giao thành công
            </MetricCard>

            {/* 2. Doanh thu tạm tính (Đang giao / Chờ xử lý) */}
            <MetricCard
              tone="blue"
              compact
              title="Doanh thu tạm tính"
              icon={<Clock className="w-4 h-4" />}
              value={formatCurrency(analytics.pendingRevenue)}
            >
              <Truck className="w-3.5 h-3.5" />
              Đơn đang giao hoặc chờ lấy hàng
            </MetricCard>

            {/* 3. Giá trị trung bình đơn (AOV) */}
            <MetricCard
              tone="amber"
              compact
              title="Giá trị TB / Đơn (AOV)"
              icon={<TrendingUp className="w-4 h-4" />}
              value={formatCurrency(analytics.averageOrderValue)}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Doanh thu trung bình mỗi đơn hoàn tất
            </MetricCard>

            {/* 4. Tổng số đơn hàng & Tỷ lệ thành công */}
            <MetricCard
              tone="purple"
              compact
              wrapValue
              title="Hiệu suất đơn hàng"
              icon={<PieChart className="w-4 h-4" />}
              value={<>{analytics.totalOrdersAll} <span className="text-sm font-medium text-gray-500">đơn phát sinh</span></>}
            >
              <span>Tỷ lệ hoàn thành: <b>{completionRate}%</b></span>
            </MetricCard>
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
                <AnalyticsTrendChart
                  timeline={analytics.timeline}
                  series={trendSeries[activeChartMetric]}
                  format={activeChartMetric === "revenue" ? "currency" : "orders"}
                />
              </div>
            </div>

            {/* Cột phải 1/3: Cơ cấu Trạng thái Đơn hàng (Doughnut Chart) */}
            <OrderStatusSummary
              title="Cơ cấu trạng thái đơn"
              totalOrders={analytics.totalOrdersAll}
              statusBreakdown={analytics.statusBreakdown}
              className="bg-gray-50/40 rounded-xl p-4"
              chartClassName="h-[170px] my-1"
            />
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
