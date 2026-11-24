import AnalyticsPeriodFilter from "../../shared/components/analytics/AnalyticsPeriodFilter";
import AnalyticsTrendChart from "../../shared/components/analytics/AnalyticsTrendChart";
import formatCurrency from "../../shared/utils/formatCurrency";
import useDashboardAnalytics from "../../shared/hooks/useDashboardAnalytics";
import MetricCard from "../../shared/components/analytics/MetricCard";
import OrderStatusSummary from "../../entities/order/components/OrderStatusSummary";
import {useState} from "react";
import {Link} from "react-router-dom";
import {
    TrendingUp,
    DollarSign,
    Percent,
    Users,
    Store,
    Package,
    BarChart3,
    RefreshCw,
    FolderTree,
    KeyRound,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    ShieldCheck,
    Truck,
} from "lucide-react";

const trendSeries = {
    financial: [
        {type: "line", key: "grossRevenue", label: "Tổng GMV Sàn (₫)", color: "#2563eb"},
        {type: "line", key: "commissionRevenue", label: "Hoa Hồng Thu Được (₫)", color: "#ee4d2d"},
    ],
    orders: [
        {type: "bar", key: "orderCount", label: "Đơn hoàn thành", color: "rgba(37, 99, 235, 0.85)"},
        {type: "bar", key: "totalCount", label: "Tổng đơn phát sinh", color: "rgba(148, 163, 184, 0.5)"},
    ],
};

const trendInteraction = {mode: "index", intersect: false};

export default function AdminDashboard() {

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
    const [loading, setLoading] = useState(true);
    const [refreshVersion, setRefreshVersion] = useState(0);

    const completionRate = useDashboardAnalytics({
        endpoint: "/commission/stats/admin/analytics",
        errorMessage: "Không thể tải thống kê sàn giao dịch",
        period: filterPeriod,
        range: filterRange,
        analytics,
        setAnalytics,
        setLoading: setLoading,
        refreshVersion,
    });

    return (
        <div className="w-full animate-fade-in flex flex-col gap-6">
            {/* 1. WELCOME & PORTAL HEADER */}
            <div
                className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-300"/>
                        <span>Shopee Clone • Trung Tâm Quản Trị Hệ Thống</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                        Thống Kê Toàn Cảnh Sàn Giao Dịch
                    </h2>
                    <p className="text-blue-100 text-sm mt-1 max-w-2xl">
                        Theo dõi tổng giá trị giao dịch (GMV), doanh thu hoa hồng sàn, hiệu suất đơn hàng và các chỉ số
                        kinh doanh then chốt.
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                        onClick={() => {
                            setLoading(true);
                            setRefreshVersion((version) => version + 1);
                        }}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-sm font-medium backdrop-blur-sm transition-all"
                        title="Làm mới dữ liệu"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}/>
                        <span>Cập nhật</span>
                    </button>
                </div>
            </div>

            {/* 2. CHỈ SỐ NỀN TẢNG (PLATFORM STATS - 4 COUNTERS) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Users className="w-5 h-5"/>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">Người dùng</div>
                        <div className="text-xl font-bold text-gray-900 mt-0.5">
                            {analytics.totalUsers || 0}
                        </div>
                    </div>
                </div>

                <Link to="/admin/shops"
                      className="bg-white border border-gray-200 hover:border-emerald-300 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Store className="w-5 h-5"/>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <span>Gian hàng (Shops)</span>
                            <ArrowUpRight className="w-3 h-3 text-emerald-600"/>
                        </div>
                        <div className="text-xl font-bold text-gray-900 mt-0.5">
                            {analytics.totalShops || 0}
                        </div>
                    </div>
                </Link>

                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Package className="w-5 h-5"/>
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
                        <CheckCircle2 className="w-5 h-5"/>
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
                <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600"/>
                            <h3 className="font-bold text-gray-900 text-lg">
                                Hiệu Quả Kinh Doanh & Phân Tích Chu Kỳ
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Chọn chu kỳ để xem biến động doanh thu theo Ngày, Tuần, Tháng hoặc Năm
                        </p>
                    </div>

                    <AnalyticsPeriodFilter
                        period={filterPeriod}
                        range={filterRange}
                        onChange={(period, range) => {
                            setLoading(true);
                            setFilterPeriod(period);
                            setFilterRange(range);
                        }}
                        tone="blue"
                    />
                </div>

                {/* 4 Thẻ Tài Chính Lớn */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Tổng GMV Sàn */}
                    <MetricCard
                        tone="blue"
                        title="Tổng GMV Toàn Sàn"
                        icon={<DollarSign className="w-4 h-4"/>}
                        value={formatCurrency(analytics.totalGrossRevenue)}
                    >
                        <CheckCircle2 className="w-3.5 h-3.5"/>
                        Từ {analytics.totalOrders || 0} đơn hoàn tất
                    </MetricCard>

                    {/* Card 2: Tổng Hoa Hồng Thu Được */}
                    <MetricCard
                        tone="orange"
                        title="Hoa Hồng Sàn Thu Được"
                        icon={<Percent className="w-4 h-4"/>}
                        value={formatCurrency(analytics.totalCommissionRevenue)}
                    >
                        <TrendingUp className="w-3.5 h-3.5"/>
                        Doanh thu thực sàn được hưởng
                    </MetricCard>

                    {/* Card 3: Thực Nhận Của Shop (Net) */}
                    <MetricCard
                        tone="emerald"
                        title="Thực Nhận Của Các Shop"
                        icon={<Store className="w-4 h-4"/>}
                        value={formatCurrency(analytics.totalNetRevenue)}
                    >
                        <span>GMV trừ đi phần hoa hồng</span>
                    </MetricCard>

                    {/* Card 4: Doanh Thu Tạm Tính (Lưu thông) */}
                    <MetricCard
                        tone="purple"
                        title="Doanh Thu Đang Lưu Thông"
                        icon={<Clock className="w-4 h-4"/>}
                        value={formatCurrency(analytics.pendingGrossRevenue)}
                    >
                        <Truck className="w-3.5 h-3.5"/>
                        Các đơn đang giao / chờ lấy
                    </MetricCard>
                </div>

                {/* KHU VỰC VẼ BIỂU ĐỒ (Dual Line Chart + Donut Status Breakdown) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                    {/* Cột Trái 2/3: Biểu đồ xu hướng */}
                    <div
                        className="lg:col-span-2 border border-gray-100 bg-gray-50/50 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span>
                  {activeChartMetric === "financial"
                      ? "Đồ thị GMV Sàn & Hoa Hồng Thu Được"
                      : "Đồ thị Khối Lượng Đơn Hàng"}
                </span>
                                {loading && (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600"/>
                                )}
                            </div>

                            {/* Chuyển đổi góc nhìn */}
                            <div
                                className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl text-xs">
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
                            <AnalyticsTrendChart
                                timeline={analytics.timeline}
                                series={trendSeries[activeChartMetric]}
                                format={activeChartMetric === "financial" ? "currency" : "orders"}
                                tooltipInteraction={trendInteraction}
                            />
                        </div>
                    </div>

                    {/* Cột Phải 1/3: Biểu đồ Donut Cơ cấu trạng thái đơn toàn sàn */}
                    <OrderStatusSummary
                        title="Cơ Cấu Trạng Thái Đơn Sàn"
                        totalOrders={analytics.totalOrdersAll}
                        statusBreakdown={analytics.statusBreakdown}
                        className="bg-gray-50/50 rounded-2xl p-5"
                        chartClassName="h-[180px] my-2"
                    />
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
                        <div
                            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Store size={22}/>
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
                        <div
                            className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Users size={22}/>
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
                        <div
                            className="p-3 bg-orange-50 text-[#ee4d2d] rounded-xl group-hover:bg-[#ee4d2d] group-hover:text-white transition-colors">
                            <Percent size={22}/>
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
                        <div
                            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <FolderTree size={22}/>
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
                        <div
                            className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <KeyRound size={22}/>
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
