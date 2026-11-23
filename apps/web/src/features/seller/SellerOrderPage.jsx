import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Eye, CheckCircle, Truck, XCircle, FileText,
  Printer, ExternalLink, Clock, CreditCard, MapPin,
  Package, Calendar, X, AlertCircle, ShoppingBag, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';

const STATUS_TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ xác nhận' },
  { id: 'CONFIRMED', label: 'Chờ lấy hàng' },
  { id: 'SHIPPING', label: 'Đang giao' },
  { id: 'COMPLETED', label: 'Thành công' },
  { id: 'CANCELLED', label: 'Đã hủy' }
];

export default function SellerOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 1 });
  const [searchInput, setSearchInput] = useState('');

  // State quản lý Modal Hóa đơn & Chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const currentStatus = searchParams.get('status') || 'ALL';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (currentStatus !== 'ALL') {
        params.status = currentStatus;
      }

      const res = await api.get('/orders/seller', { params });
      const pageResponse = res.data.result;

      setOrders(pageResponse.data || []);
      setPageInfo({
        currentPage: pageResponse.currentPage || 1,
        totalPages: pageResponse.totalPages || 1,
      });

      // Nếu đang mở modal đơn hàng nào đó, cập nhật lại dữ liệu đơn đó
      if (selectedOrder) {
        const updated = pageResponse.data?.find((o) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleRealtimeUpdate = () => {
      console.log('[🔔] Nhận sự kiện đơn hàng mới -> Tự động nạp lại danh sách!');
      fetchOrders();
    };

    window.addEventListener('order_updated', handleRealtimeUpdate);
    window.addEventListener('new_notification', handleRealtimeUpdate);

    return () => {
      window.removeEventListener('order_updated', handleRealtimeUpdate);
      window.removeEventListener('new_notification', handleRealtimeUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, currentStatus]);

  const updateParams = (newParams) => {
    const current = Object.fromEntries([...searchParams]);
    const updated = { ...current, ...newParams };
    Object.keys(updated).forEach((key) => {
      if (!updated[key] || updated[key] === 'ALL') delete updated[key];
    });
    setSearchParams(updated);
  };

  // --- CÁC HÀM XỬ LÝ NGHIỆP VỤ ĐƠN HÀNG ---
  const handleAction = async (orderId, actionName, endpoint) => {
    if (!window.confirm(`Bạn muốn ${actionName} đơn hàng #${orderId}?`)) return;
    try {
      await api.patch(`/orders/${orderId}/${endpoint}`);
      toast.success(`${actionName} thành công!`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || `Lỗi khi ${actionName}`);
    }
  };

  // --- TIỆN ÍCH HIỂN THỊ ---
  const parseAddress = (addressSnapshot) => {
    try {
      if (addressSnapshot) {
        return JSON.parse(addressSnapshot);
      }
    } catch (e) {
      console.error('Lỗi parse địa chỉ');
    }
    return null;
  };

  const getCustomerInfo = (order) => {
    const addr = parseAddress(order.addressSnapshot);
    if (addr) {
      return (
        <div className="text-sm">
          <div className="font-semibold text-gray-900 flex items-center gap-1.5">
            <span>{addr.receiverName}</span>
          </div>
          <div className="text-xs text-gray-500 font-mono mt-0.5">{addr.phone}</div>
          <div
            className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed"
            title={`${addr.street || ''}, ${addr.ward || ''}, ${addr.district || ''}, ${addr.province || ''}`}
          >
            {addr.province ? `${addr.district ? `${addr.district}, ` : ''}${addr.province}` : 'Việt Nam'}
          </div>
        </div>
      );
    }
    return (
      <div className="text-sm font-medium text-gray-800">
        Khách hàng #{order.buyerId || 'N/A'}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full">
            <Clock size={12} className="text-amber-500" /> Chờ xác nhận
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full">
            <Package size={12} className="text-blue-500" /> Chờ lấy hàng
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold rounded-full">
            <Truck size={12} className="text-purple-500" /> Đang giao
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-full">
            <CheckCircle size={12} className="text-green-500" /> Hoàn thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold rounded-full">
            <XCircle size={12} className="text-gray-400" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
            {status}
          </span>
        );
    }
  };

  const getPaymentLabel = (method, status) => {
    let name = 'Thanh toán COD';
    if (method === 'BANK_TRANSFER' || method === 'MOCK_ONLINE') {
      name = 'Chuyển khoản / VNPAY';
    }
    const isPaid = status === 'PAID';
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-[11px] text-gray-500 font-medium">{name}</span>
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
            isPaid
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </span>
      </div>
    );
  };

  // Lọc theo search keyword ở frontend nếu có nhập
  const filteredOrders = orders.filter((o) => {
    if (!searchInput.trim()) return true;
    const query = searchInput.toLowerCase();
    const idMatch = String(o.id).includes(query);
    const addr = parseAddress(o.addressSnapshot);
    const nameMatch = addr?.receiverName?.toLowerCase().includes(query);
    const phoneMatch = addr?.phone?.includes(query);
    return idMatch || nameMatch || phoneMatch;
  });

  return (
    <div className="pb-20 animate-fade-in w-full">
      {/* ================= HEADER PAGE ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-green-600" size={26} /> Quản lý Đơn hàng
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Theo dõi, xử lý đơn hàng và in hóa đơn giao vận cho khách hàng
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-[280px]">
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách, SĐT..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full text-xs py-2 pl-9 pr-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-xs transition-all"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= CARD BẢNG ĐƠN HÀNG ================= */}
      <div className="bg-white border border-gray-200/90 rounded-2xl shadow-sm overflow-hidden w-full transition-all">
        {/* --- TABS TRẠNG THÁI --- */}
        <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar bg-gray-50/50 px-2 pt-2 gap-1">
          {STATUS_TABS.map((tab) => {
            const isActive = currentStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => updateParams({ status: tab.id, page: 1 })}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all relative whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-green-700 shadow-xs border-t-2 border-green-600 font-bold'
                    : 'text-gray-600 hover:text-green-600 hover:bg-gray-100/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* --- BẢNG ĐƠN HÀNG --- */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-gray-600 border-collapse">
            <thead className="bg-gray-50/80 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5 w-32">Mã đơn</th>
                <th className="px-5 py-3.5 w-48">Khách hàng</th>
                <th className="px-5 py-3.5 min-w-[320px]">Sản phẩm đặt mua</th>
                <th className="px-5 py-3.5 text-right w-44">Tổng tiền & TT</th>
                <th className="px-5 py-3.5 text-center w-36">Trạng thái</th>
                <th className="px-5 py-3.5 text-center w-48">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <div className="inline-flex flex-col items-center gap-2">
                      <span className="loading loading-spinner text-green-600 loading-md"></span>
                      <span className="text-xs text-gray-400">Đang tải danh sách đơn hàng...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-gray-400">
                    <div className="text-5xl mb-3">📦</div>
                    <p className="text-sm font-medium text-gray-600">Không có đơn hàng nào.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchInput ? 'Không tìm thấy đơn khớp từ khóa tìm kiếm' : 'Chưa có đơn hàng trong mục này'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-green-50/30 transition-colors group"
                  >
                    {/* CỘT 1: MÃ ĐƠN HÀNG */}
                    <td className="px-5 py-4 align-top">
                      <div className="font-bold text-gray-900 font-mono text-sm">
                        #{order.id}
                      </div>
                      <div className="text-[11px] text-gray-400 font-normal mt-1 flex items-center gap-1">
                        <Calendar size={11} />
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                      </div>
                      {order.note && (
                        <div
                          className="mt-1.5 inline-block text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 max-w-[110px] truncate"
                          title={`Ghi chú: ${order.note}`}
                        >
                          💬 {order.note}
                        </div>
                      )}
                    </td>

                    {/* CỘT 2: KHÁCH HÀNG */}
                    <td className="px-5 py-4 align-top">
                      {getCustomerInfo(order)}
                    </td>

                    {/* CỘT 3: SẢN PHẨM (CLICK ĐƯỢC VÀO CHI TIẾT SẢN PHẨM) */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-col gap-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            {/* ẢNH SẢN PHẨM CÓ LINK CHI TIẾT */}
                            <Link
                              to={`/product/${item.productId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-gray-50 hover:opacity-90 hover:ring-2 hover:ring-green-500 transition-all block"
                              title="Xem trang sản phẩm"
                            >
                              <img
                                src={item.productImageUrl || 'https://via.placeholder.com/48'}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </Link>

                            <div className="flex-1 min-w-0">
                              {/* TÊN SẢN PHẨM CÓ LINK CHI TIẾT */}
                              <Link
                                to={`/product/${item.productId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-gray-800 hover:text-green-600 line-clamp-2 leading-snug group/item inline-flex items-center gap-1 transition-colors"
                                title="Mở chi tiết sản phẩm trong tab mới"
                              >
                                <span>{item.productName}</span>
                                <ExternalLink
                                  size={11}
                                  className="text-gray-400 group-hover/item:text-green-600 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                />
                              </Link>

                              {/* BIẾN THỂ / PHÂN LOẠI HÀNG */}
                              {item.variantName && (
                                <div className="text-[11px] text-gray-500 mt-0.5">
                                  <span className="bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                                    {item.variantName}
                                  </span>
                                </div>
                              )}

                              {/* ĐƠN GIÁ VÀ SỐ LƯỢNG */}
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="font-semibold text-gray-700">
                                  ₫{item.productPrice?.toLocaleString('vi-VN')}
                                </span>{' '}
                                <span className="text-gray-400">×</span>{' '}
                                <span className="font-bold text-gray-800">{item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* CỘT 4: TỔNG TIỀN VÀ TRẠNG THÁI THANH TOÁN */}
                    <td className="px-5 py-4 align-top text-right">
                      <div className="font-bold text-green-600 text-base font-mono">
                        ₫{order.totalAmount?.toLocaleString('vi-VN')}
                      </div>
                      <div className="mt-1">
                        {getPaymentLabel(order.paymentMethod, order.paymentStatus)}
                      </div>
                    </td>

                    {/* CỘT 5: TRẠNG THÁI ĐƠN HÀNG */}
                    <td className="px-5 py-4 align-top text-center">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* CỘT 6: THAO TÁC RÕ RÀNG, ĐẸP MẮT */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        {/* 1. NÚT CHUYỂN TRẠNG THÁI ĐƠN HÀNG (PRIMARY ACTION) */}
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleAction(order.id, 'Xác nhận & Chuẩn bị hàng', 'confirm')}
                            className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all hover:shadow"
                          >
                            <CheckCircle size={14} /> Chuẩn bị hàng
                          </button>
                        )}

                        {order.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleAction(order.id, 'Giao cho đơn vị vận chuyển', 'ship')}
                            className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all hover:shadow"
                          >
                            <Truck size={14} /> Giao ĐVVC
                          </button>
                        )}

                        {/* 2. NÚT XEM CHI TIẾT & HÓA ĐƠN (MỞ MODAL) */}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="w-full px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 hover:text-green-700 border border-gray-200 hover:border-green-300 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs"
                          title="Xem chi tiết đơn hàng và in hóa đơn bán hàng"
                        >
                          <FileText size={13} className="text-gray-500" /> Chi tiết & Hóa đơn
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PHÂN TRANG --- */}
        {!loading && pageInfo.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
            <div className="text-xs text-gray-500">
              Trang <span className="font-bold text-gray-700">{pageInfo.currentPage}</span> / {pageInfo.totalPages}
            </div>
            <div className="join gap-1">
              <button
                disabled={page === 1}
                onClick={() => updateParams({ page: page - 1 })}
                className="join-item btn btn-xs bg-white border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                « Trước
              </button>
              {Array.from({ length: pageInfo.totalPages }).map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => updateParams({ page: idx + 1 })}
                  className={`join-item btn btn-xs border-gray-300 min-w-7 font-medium ${
                    page === idx + 1
                      ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                disabled={page === pageInfo.totalPages}
                onClick={() => updateParams({ page: page + 1 })}
                className="join-item btn btn-xs bg-white border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Sau »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================= */}
      {/* ===== MODAL CHI TIẾT ĐƠN HÀNG & HÓA ĐƠN BÁN HÀNG ====== */}
      {/* ======================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200">
            {/* --- HEADER MODAL --- */}
            <div className="px-6 py-4 bg-gradient-to-r from-green-700 to-green-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <FileText size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-white tracking-wide">
                      HÓA ĐƠN BÁN HÀNG
                    </h3>
                    <span className="font-mono bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      #{selectedOrder.id}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5 flex items-center gap-1.5">
                    <Calendar size={12} />
                    Đặt lúc: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="In hóa đơn đơn hàng này"
                >
                  <Printer size={15} /> In hóa đơn
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* --- BODY MODAL (SCROLLABLE & INVOICE LAYOUT) --- */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm" id="printable-order-invoice">
              {/* PHẦN 1: THÔNG TIN GIAO HÀNG & THANH TOÁN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* KHỐI GIAO HÀNG */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60">
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-xs uppercase tracking-wider mb-2.5">
                    <MapPin size={15} className="text-green-600" />
                    Địa chỉ nhận hàng
                  </div>
                  {(() => {
                    const addr = parseAddress(selectedOrder.addressSnapshot);
                    if (!addr) {
                      return <p className="text-xs text-gray-500">Khách hàng #{selectedOrder.buyerId}</p>;
                    }
                    return (
                      <div className="text-xs space-y-1 text-gray-700">
                        <div className="font-bold text-gray-900 text-sm">{addr.receiverName}</div>
                        <div className="font-mono text-gray-600">{addr.phone}</div>
                        <div className="text-gray-600 leading-relaxed pt-1">
                          {[addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* KHỐI THANH TOÁN & TRẠNG THÁI */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-gray-900 text-xs uppercase tracking-wider mb-2.5">
                      <CreditCard size={15} className="text-blue-600" />
                      Thông tin thanh toán & Vận chuyển
                    </div>
                    <div className="text-xs space-y-2 text-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Hình thức thanh toán:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedOrder.paymentMethod === 'BANK_TRANSFER' || selectedOrder.paymentMethod === 'MOCK_ONLINE'
                            ? 'Chuyển khoản / VNPAY'
                            : 'Thanh toán khi nhận hàng (COD)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Trạng thái thanh toán:</span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            selectedOrder.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {selectedOrder.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Trạng thái đơn hàng:</span>
                        <div>{getStatusBadge(selectedOrder.status)}</div>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.note && (
                    <div className="mt-3 pt-2.5 border-t border-gray-200 text-xs">
                      <span className="font-semibold text-gray-700">Ghi chú từ khách: </span>
                      <span className="text-gray-600 italic">"{selectedOrder.note}"</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PHẦN 2: BẢNG CHI TIẾT SẢN PHẨM TRONG HÓA ĐƠN */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2.5 flex items-center gap-1.5">
                  <Package size={15} className="text-green-600" /> Chi tiết các sản phẩm
                </h4>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">STT</th>
                        <th className="px-4 py-3 min-w-[220px]">Sản phẩm</th>
                        <th className="px-4 py-3 text-center">Phân loại</th>
                        <th className="px-4 py-3 text-right">Đơn giá</th>
                        <th className="px-4 py-3 text-center">Số lượng</th>
                        <th className="px-4 py-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3 text-gray-400 font-mono text-center w-12">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Link
                                to={`/product/${item.productId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded border border-gray-200 overflow-hidden shrink-0 bg-gray-50"
                              >
                                <img
                                  src={item.productImageUrl || 'https://via.placeholder.com/40'}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              </Link>
                              <div>
                                <Link
                                  to={`/product/${item.productId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-gray-900 hover:text-green-600 line-clamp-2 inline-flex items-center gap-1 group/name"
                                >
                                  <span>{item.productName}</span>
                                  <ExternalLink size={10} className="text-gray-400 group-hover/name:text-green-600" />
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {item.variantName ? (
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium">
                                {item.variantName}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-700">
                            ₫{item.productPrice?.toLocaleString('vi-VN')}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900 font-mono">
                            ₫{(item.totalPrice || (item.productPrice * item.quantity))?.toLocaleString('vi-VN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PHẦN 3: TỔNG KẾT HÓA ĐƠN */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-80 space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Tiền hàng tạm tính:</span>
                    <span className="font-semibold text-gray-800">
                      ₫{selectedOrder.totalAmount?.toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="font-semibold text-emerald-600">Miễn phí</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-900">Tổng thanh toán:</span>
                    <span className="font-black text-lg text-green-700 font-mono">
                      ₫{selectedOrder.totalAmount?.toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- FOOTER MODAL (CÁC THAO TÁC) --- */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-500 italic">
                * Hóa đơn này là căn cứ giao dịch giữa người mua và shop.
              </div>

              <div className="flex items-center gap-3">
                {selectedOrder.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      handleAction(selectedOrder.id, 'Xác nhận & Chuẩn bị hàng', 'confirm');
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle size={15} /> Xác nhận & Chuẩn bị hàng
                  </button>
                )}

                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    onClick={() => {
                      handleAction(selectedOrder.id, 'Giao cho đơn vị vận chuyển', 'ship');
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Truck size={15} /> Bàn giao vận chuyển
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}