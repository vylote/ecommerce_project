import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../shared/utils/api";
import toast from "react-hot-toast";
import {
  Store,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Info,
  RefreshCw,
  ShieldAlert,
  User,
  Mail,
  Phone,
  Calendar,
  Package,
  Star,
  MapPin,
  Tag,
  Eye,
  Lock,
  Unlock,
} from "lucide-react";

export default function ShopManagementPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | LOCKED

  // Summary counts
  const [stats, setStats] = useState({ total: 0, active: 0, locked: 0 });

  // Detail Modal
  const [selectedShop, setSelectedShop] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Action Confirmation Modal (Lock / Unlock)
  const [actionShop, setActionShop] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/shops/admin/stats");
      if (res.data?.result) {
        setStats(res.data.result);
      }
    } catch (err) {
      console.error("Error fetching shop stats:", err);
    }
  };

  // Fetch Shops list
  const fetchShops = async () => {
    setLoading(true);
    try {
      let isActiveParam = "";
      if (statusFilter === "ACTIVE") isActiveParam = "&isActive=true";
      if (statusFilter === "LOCKED") isActiveParam = "&isActive=false";

      const kwParam = keyword ? `&keyword=${encodeURIComponent(keyword)}` : "";
      const res = await api.get(
        `/shops/admin?page=${page}&size=10${kwParam}${isActiveParam}`
      );

      const pageData = res.data?.result;
      setShops(pageData?.data || []);
      setTotalPages(pageData?.totalPages || 1);
      setTotalElements(pageData?.totalElements || 0);
    } catch (err) {
      console.error("Error fetching admin shops:", err);
      toast.error("Không thể tải danh sách gian hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchShops();
  }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchShops();
  };

  const handleResetSearch = () => {
    setKeyword("");
    setStatusFilter("ALL");
    setPage(1);
  };

  // Toggle Shop Active status
  const handleToggleStatus = async () => {
    if (!actionShop) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/shops/admin/${actionShop.id}/toggle-status`);
      const updated = res.data?.result;
      toast.success(
        updated?.isActive
          ? `Đã mở khóa hoạt động cho Shop "${actionShop.name}"`
          : `Đã tạm khóa Shop "${actionShop.name}"`
      );
      setActionShop(null);
      fetchShops();
      fetchStats();
    } catch (err) {
      console.error("Toggle shop status error:", err);
      toast.error("Thao tác thất bại, vui lòng thử lại!");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in flex flex-col gap-6">
      {/* 1. HEADER & POLICY BANNER */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Store className="w-4 h-4" />
            <span>Hệ Thống Gian Hàng Shopee Clone</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Quản Lý Danh Sách Gian Hàng (Shops)
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Giám sát trạng thái hoạt động, thông tin liên hệ và tuân thủ quy chế sàn của các đối tác người bán.
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            fetchShops();
          }}
          className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium transition-all self-start md:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Thông báo nguyên tắc không can thiệp sâu */}
      <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-blue-900 text-xs">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Nguyên tắc quản trị sàn: </span>
          Admin chỉ thực hiện vai trò kiểm duyệt hồ sơ, tiếp nhận báo cáo vi phạm và chế tài khóa / mở khóa hoạt động của gian hàng.
          Hệ thống đảm bảo <span className="font-semibold underline">không can thiệp sâu</span> vào việc sửa đổi giá bán, sửa đổi nội dung sản phẩm hay can thiệp vào kho hàng nội bộ của người bán.
        </div>
      </div>

      {/* 2. STATS COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Tổng số Shop</div>
            <div className="text-2xl font-black text-gray-900 mt-0.5">
              {stats.total || 0}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Đang hoạt động</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              {stats.active || 0}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Đang bị khóa / Tạm dừng</div>
            <div className="text-2xl font-black text-rose-600 mt-0.5">
              {stats.locked || 0}
            </div>
          </div>
        </div>
      </div>

      {/* 3. FILTERS & SEARCH */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên Shop, tên chủ shop, email..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động (Active)</option>
              <option value="LOCKED">Đang bị khóa (Locked)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={handleResetSearch}
              className="px-3.5 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
            >
              Đặt lại
            </button>
          </div>
        </form>
      </div>

      {/* 4. SHOPS DATA TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Gian hàng (Shop)</th>
                <th className="py-3.5 px-4">Chủ sở hữu (Seller)</th>
                <th className="py-3.5 px-4 text-center">Đánh giá</th>
                <th className="py-3.5 px-4 text-center">Sản phẩm</th>
                <th className="py-3.5 px-4">Ngành hàng</th>
                <th className="py-3.5 px-4">Ngày tham gia</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Đang tải danh sách gian hàng...</span>
                    </div>
                  </td>
                </tr>
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Store className="w-10 h-10 text-gray-300" />
                      <span>Không tìm thấy gian hàng nào phù hợp</span>
                    </div>
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* 1. Tên Shop & Logo */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                          {shop.logoUrl ? (
                            <img
                              src={shop.logoUrl}
                              alt={shop.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Store className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <span>{shop.name}</span>
                            <span className="text-[11px] font-normal text-gray-400">
                              #{shop.id}
                            </span>
                          </div>
                          {shop.address && (
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate max-w-[200px]" title={shop.address}>
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{shop.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Chủ shop */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {shop.sellerName || "Chưa cập nhật"}
                        </span>
                        <span className="text-xs text-gray-400 truncate max-w-[180px]">
                          {shop.sellerEmail}
                        </span>
                        {shop.sellerPhone && (
                          <span className="text-[11px] text-gray-400">
                            {shop.sellerPhone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Đánh giá */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-xs font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{shop.rating ? shop.rating.toFixed(1) : "0.0"}</span>
                      </div>
                    </td>

                    {/* 4. Số sản phẩm */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold text-gray-800">
                        {shop.productCount || 0}
                      </span>
                    </td>

                    {/* 5. Ngành hàng */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {shop.categories && shop.categories.length > 0 ? (
                          shop.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat.id}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px]"
                            >
                              {cat.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">Chung</span>
                        )}
                        {shop.categories && shop.categories.length > 2 && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px]">
                            +{shop.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 6. Ngày tham gia */}
                    <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {shop.createdAt
                        ? new Date(shop.createdAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>

                    {/* 7. Trạng thái */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {shop.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          Đang bị khóa
                        </span>
                      )}
                    </td>

                    {/* 8. Hành động */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Chi tiết */}
                        <button
                          onClick={() => {
                            setSelectedShop(shop);
                            setShowDetailModal(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết hồ sơ Shop"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Khóa / Mở khóa */}
                        <button
                          onClick={() => setActionShop(shop)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            shop.isActive
                              ? "text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                              : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={shop.isActive ? "Tạm khóa gian hàng" : "Mở khóa gian hàng"}
                        >
                          {shop.isActive ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang (Pagination) */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Hiển thị <b>{shops.length}</b> trên tổng số <b>{totalElements}</b> gian hàng
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trang trước
            </button>
            <span className="font-semibold text-gray-700">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: XEM CHI TIẾT HỒ SƠ GIAN HÀNG */}
      {showDetailModal && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                  {selectedShop.logoUrl ? (
                    <img
                      src={selectedShop.logoUrl}
                      alt={selectedShop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {selectedShop.name}
                  </h3>
                  <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                    <span>Mã Shop: #{selectedShop.id}</span>
                    <span>•</span>
                    <span className={selectedShop.isActive ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                      {selectedShop.isActive ? "Đang hoạt động" : "Đang bị khóa"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-gray-600 max-h-[75vh] overflow-y-auto">
              {/* Mô tả Shop */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Mô tả gian hàng
                </label>
                <div className="p-3 bg-gray-50 rounded-xl text-gray-600 leading-relaxed">
                  {selectedShop.description || "Chưa có mô tả gian hàng."}
                </div>
              </div>

              {/* Thông tin chủ sở hữu (Seller) */}
              <div className="border border-gray-100 rounded-xl p-3.5 bg-gray-50/50 space-y-2">
                <div className="font-bold text-gray-800 text-xs flex items-center gap-1.5 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Thông tin chủ gian hàng (Seller)
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block">Họ & tên:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedShop.sellerName || "Chưa có"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">ID tài khoản:</span>
                    <span className="font-semibold text-gray-800">
                      #{selectedShop.sellerId}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Email liên hệ:</span>
                    <span className="font-semibold text-gray-800 truncate block">
                      {selectedShop.sellerEmail || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Số điện thoại:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedShop.sellerPhone || "Chưa có"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Địa chỉ & Danh mục */}
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400 block mb-0.5">Địa chỉ kho / Shop:</span>
                  <div className="flex items-start gap-1.5 text-gray-700 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>{selectedShop.address || "Chưa cập nhật địa chỉ"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block mb-1">Ngành hàng đăng ký:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedShop.categories && selectedShop.categories.length > 0 ? (
                      selectedShop.categories.map((c) => (
                        <span
                          key={c.id}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium text-[11px]"
                        >
                          {c.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">Chưa gắn danh mục ngành hàng cụ thể</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Thông tin vận hành */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block text-[11px]">Đánh giá</span>
                  <span className="font-black text-amber-600 text-sm">
                    {selectedShop.rating ? selectedShop.rating.toFixed(1) : "0.0"} ★
                  </span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block text-[11px]">Sản phẩm</span>
                  <span className="font-black text-gray-800 text-sm">
                    {selectedShop.productCount || 0}
                  </span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block text-[11px]">Ngày gia nhập</span>
                  <span className="font-bold text-gray-800 text-[11px] block mt-0.5">
                    {selectedShop.createdAt
                      ? new Date(selectedShop.createdAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: XÁC NHẬN KHÓA / MỞ KHÓA GIAN HÀNG */}
      {actionShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  actionShop.isActive
                    ? "bg-rose-100 text-rose-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {actionShop.isActive ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {actionShop.isActive
                    ? `Tạm khóa Shop "${actionShop.name}"?`
                    : `Mở khóa Shop "${actionShop.name}"?`}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Mã Shop: #{actionShop.id} • Chủ sở hữu: {actionShop.sellerName || actionShop.sellerEmail}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
              {actionShop.isActive
                ? "Khi bị tạm khóa, gian hàng và các sản phẩm của shop này sẽ tạm thời không hiển thị đối với người mua trên sàn cho đến khi được Admin mở khóa lại."
                : "Khi mở khóa, gian hàng sẽ được khôi phục hoạt động bình thường trên sàn thương mại điện tử."}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActionShop(null)}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors ${
                  actionShop.isActive
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {actionLoading
                  ? "Đang xử lý..."
                  : actionShop.isActive
                  ? "Xác nhận tạm khóa"
                  : "Xác nhận mở khóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
