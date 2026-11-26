import FilterTabs from "../../shared/ui/FilterTabs";
import ProductImage from "../../shared/components/ProductImage";
import { NEW_NOTIFICATION_EVENT, ORDER_UPDATED_EVENT } from "../../shared/constants";
import useReloadableRequest from "../../shared/hooks/useReloadableRequest";
import Pagination from "../../shared/components/Pagination";
import SearchField from "../../shared/ui/SearchField";
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle, Truck, XCircle, FileText,
  Printer, ExternalLink, Clock, CreditCard, MapPin,
  Package, Calendar, X, ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';

const STATUS_TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Chờ lấy hàng' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'COMPLETED', label: 'Thành công' },
  { value: 'CANCELLED', label: 'Đã hủy' }
];

const rowActionClass = "inline-flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";
const primaryRowActionClass = `${rowActionClass} border-transparent bg-primary text-primary-content hover:bg-secondary hover:text-secondary-content`;

export default function SellerOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 1 });
  const [searchInput, setSearchInput] = useState('');

  // State quản lý Modal Hóa đơn & Chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState(null);

  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const currentStatus = searchParams.get('status') || 'ALL';

  const loadOrders = useCallback(async (signal) => {
    const params = { page, size: 10 };
    if (currentStatus !== 'ALL') params.status = currentStatus;

    const response = await api.get('/orders/seller', { params, signal });
    if (signal.aborted) return;

    const result = response.data.result;
    const list = result.data || [];
    setOrders(list);
    setPageInfo({
      currentPage: result.currentPage || 1,
      totalPages: result.totalPages || 1,
    });
    setSelectedOrder((current) => current && (list.find((order) => order.id === current.id) ?? current));
  }, [page, currentStatus]);
  const { loading, reload: fetchOrders } = useReloadableRequest(
    loadOrders,
    () => toast.error('Lỗi khi tải danh sách đơn hàng'),
  );

  useEffect(() => {
    window.addEventListener(ORDER_UPDATED_EVENT, fetchOrders);
    window.addEventListener(NEW_NOTIFICATION_EVENT, fetchOrders);
    return () => {
      window.removeEventListener(ORDER_UPDATED_EVENT, fetchOrders);
      window.removeEventListener(NEW_NOTIFICATION_EVENT, fetchOrders);
    };
  }, [fetchOrders]);

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
    } catch {
      console.error('Lỗi parse địa chỉ');
    }
    return null;
  };

  const getCustomerInfo = (order) => {
    const addr = parseAddress(order.addressSnapshot);
    if (addr) {
      return (
        <div className="text-sm">
          <div className="font-semibold text-base-content flex items-center gap-1.5">
            <span>{addr.receiverName}</span>
          </div>
          <div className="text-xs text-base-content/70 font-mono mt-0.5">{addr.phone}</div>
          <div
            className="text-xs text-base-content/70 mt-1 line-clamp-2 leading-relaxed"
            title={`${addr.street || ''}, ${addr.ward || ''}, ${addr.district || ''}, ${addr.province || ''}`}
          >
            {addr.province ? `${addr.district ? `${addr.district}, ` : ''}${addr.province}` : 'Việt Nam'}
          </div>
        </div>
      );
    }
    return (
      <div className="text-sm font-medium text-base-content">
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-secondary border border-primary/25 text-xs font-semibold rounded-full">
            <CheckCircle size={12} className="text-secondary" /> Hoàn thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-base-300 text-base-content/80 border border-base-300 text-xs font-semibold rounded-full">
            <XCircle size={12} className="text-base-content/60" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-base-300 text-base-content/80 text-xs font-semibold rounded-full">
            {status}
          </span>
        );
    }
  };

  const paymentMethodLabels = {
    ZALOPAY: 'Zalopay (Sandbox)',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
    MOCK_ONLINE: 'Thanh toán online (demo)',
  };

  const getPaymentLabel = (method, status) => {
    const name = paymentMethodLabels[method] ?? 'Thanh toán COD';
    const isPaid = status === 'PAID';
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-[11px] text-base-content/70 font-medium">{name}</span>
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
            isPaid
              ? 'bg-primary/10 text-secondary border border-primary/25'
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
          <h2 className="text-2xl font-black text-base-content tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-secondary" size={26} /> Quản lý Đơn hàng
          </h2>
          <p className="text-xs text-base-content/70 mt-1">
            Theo dõi, xử lý đơn hàng và in hóa đơn giao vận cho khách hàng
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <SearchField value={searchInput} onChange={setSearchInput} placeholder="Tìm mã đơn, tên khách, SĐT..."
            onClear={() => setSearchInput("")}
            className="flex-1 md:w-[280px]"
          />
        </div>
      </div>

      {/* ================= CARD BẢNG ĐƠN HÀNG ================= */}
      <div className="bg-base-100 border border-base-300/90 rounded-2xl shadow-sm overflow-hidden w-full transition-all">
        <div className="border-b border-base-300">
          <FilterTabs
            label="Lọc trạng thái đơn hàng"
            options={STATUS_TABS}
            value={currentStatus}
            onChange={(status) => updateParams({ status, page: 1 })}
          />
        </div>

        {/* --- BẢNG ĐƠN HÀNG --- */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-base-content/80 border-collapse">
            <thead className="bg-base-200/80 text-base-content/85 text-xs font-bold uppercase tracking-wider border-b border-base-300">
              <tr>
                <th className="px-5 py-3.5 w-32">Mã đơn</th>
                <th className="px-5 py-3.5 w-48">Khách hàng</th>
                <th className="px-5 py-3.5 min-w-[320px]">Sản phẩm đặt mua</th>
                <th className="px-5 py-3.5 text-right w-44">Tổng tiền & TT</th>
                <th className="px-5 py-3.5 text-center w-36">Trạng thái</th>
                <th className="w-28 whitespace-nowrap px-3 py-3.5 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-base-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <div className="inline-flex flex-col items-center gap-2">
                      <span className="loading loading-spinner text-secondary loading-md"></span>
                      <span className="text-xs text-base-content/60">Đang tải danh sách đơn hàng...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-base-content/60">
                    <div className="text-5xl mb-3">📦</div>
                    <p className="text-sm font-medium text-base-content/80">Không có đơn hàng nào.</p>
                    <p className="text-xs text-base-content/60 mt-1">
                      {searchInput ? 'Không tìm thấy đơn khớp từ khóa tìm kiếm' : 'Chưa có đơn hàng trong mục này'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-primary/5 transition-colors group"
                  >
                    {/* CỘT 1: MÃ ĐƠN HÀNG */}
                    <td className="px-5 py-4 align-top">
                      <div className="font-bold text-base-content font-mono text-sm">
                        #{order.id}
                      </div>
                      <div className="text-[11px] text-base-content/60 font-normal mt-1 flex items-center gap-1">
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
                              className="w-12 h-12 rounded-lg border border-base-300 overflow-hidden shrink-0 bg-base-200 hover:opacity-90 hover:ring-2 hover:ring-accent transition-all block"
                              title="Xem trang sản phẩm"
                            >
                              <ProductImage
                                src={item.productImageUrl}
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
                                className="text-xs font-semibold text-base-content hover:text-secondary line-clamp-2 leading-snug group/item inline-flex items-center gap-1 transition-colors"
                                title="Mở chi tiết sản phẩm trong tab mới"
                              >
                                <span>{item.productName}</span>
                                <ExternalLink
                                  size={11}
                                  className="text-base-content/60 group-hover/item:text-secondary shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                />
                              </Link>

                              {/* BIẾN THỂ / PHÂN LOẠI HÀNG */}
                              {item.variantName && (
                                <div className="text-[11px] text-base-content/70 mt-0.5">
                                  <span className="bg-base-300 text-base-content/80 px-1.5 py-0.2 rounded font-medium">
                                    {item.variantName}
                                  </span>
                                </div>
                              )}

                              {/* ĐƠN GIÁ VÀ SỐ LƯỢNG */}
                              <div className="text-xs text-base-content/70 mt-1">
                                <span className="font-semibold text-base-content/85">
                                  ₫{item.productPrice?.toLocaleString('vi-VN')}
                                </span>{' '}
                                <span className="text-base-content/60">×</span>{' '}
                                <span className="font-bold text-base-content">{item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* CỘT 4: TỔNG TIỀN VÀ TRẠNG THÁI THANH TOÁN */}
                    <td className="px-5 py-4 align-top text-right">
                      <div className="font-bold text-secondary text-base font-mono">
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

                    <td className="px-3 py-4 text-center align-top">
                      <div className="inline-flex items-center gap-2">
                        {order.status === 'PENDING' && (order.paymentMethod !== 'ZALOPAY' || order.paymentStatus === 'PAID') && (
                          <button
                            type="button"
                            aria-label="Chuẩn bị hàng"
                            title="Chuẩn bị hàng"
                            onClick={() => handleAction(order.id, 'Xác nhận & Chuẩn bị hàng', 'confirm')}
                            className={primaryRowActionClass}
                          >
                            <CheckCircle size={18} aria-hidden="true" />
                          </button>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <button
                            type="button"
                            aria-label="Giao cho đơn vị vận chuyển"
                            title="Giao cho đơn vị vận chuyển"
                            onClick={() => handleAction(order.id, 'Giao cho đơn vị vận chuyển', 'ship')}
                            className={primaryRowActionClass}
                          >
                            <Truck size={18} aria-hidden="true" />
                          </button>
                        )}
                        <button
                          type="button"
                          aria-label="Chi tiết và hóa đơn"
                          title="Chi tiết và hóa đơn"
                          onClick={() => setSelectedOrder(order)}
                          className={`${rowActionClass} border-base-300 bg-base-100 text-base-content/85 hover:border-primary/35 hover:bg-base-200 hover:text-secondary`}
                        >
                          <FileText size={18} aria-hidden="true" />
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
          <Pagination
            currentPage={page}
            totalPages={pageInfo.totalPages}
            onPageChange={(nextPage) => updateParams({ page: nextPage })}
            className="border-t border-base-300 !justify-center"
          />
        )}
      </div>

      {/* ======================================================= */}
      {/* ===== MODAL CHI TIẾT ĐƠN HÀNG & HÓA ĐƠN BÁN HÀNG ====== */}
      {/* ======================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
          <div className="bg-base-100 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-base-300">
            {/* --- HEADER MODAL --- */}
            <div className="px-6 py-4 bg-gradient-to-r from-secondary to-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-base-100/15 flex items-center justify-center text-white">
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
                  className="px-3 py-1.5 bg-white/20 hover:bg-base-100/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
                <div className="p-4 rounded-xl border border-base-300 bg-base-200/60">
                  <div className="flex items-center gap-2 font-bold text-base-content text-xs uppercase tracking-wider mb-2.5">
                    <MapPin size={15} className="text-secondary" />
                    Địa chỉ nhận hàng
                  </div>
                  {(() => {
                    const addr = parseAddress(selectedOrder.addressSnapshot);
                    if (!addr) {
                      return <p className="text-xs text-base-content/70">Khách hàng #{selectedOrder.buyerId}</p>;
                    }
                    return (
                      <div className="text-xs space-y-1 text-base-content/85">
                        <div className="font-bold text-base-content text-sm">{addr.receiverName}</div>
                        <div className="font-mono text-base-content/80">{addr.phone}</div>
                        <div className="text-base-content/80 leading-relaxed pt-1">
                          {[addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* KHỐI THANH TOÁN & TRẠNG THÁI */}
                <div className="p-4 rounded-xl border border-base-300 bg-base-200/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-base-content text-xs uppercase tracking-wider mb-2.5">
                      <CreditCard size={15} className="text-secondary" />
                      Thông tin thanh toán & Vận chuyển
                    </div>
                    <div className="text-xs space-y-2 text-base-content/85">
                      <div className="flex justify-between items-center">
                        <span className="text-base-content/70">Hình thức thanh toán:</span>
                        <span className="font-semibold text-base-content">
                          {paymentMethodLabels[selectedOrder.paymentMethod] ?? 'Thanh toán khi nhận hàng (COD)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-base-content/70">Trạng thái thanh toán:</span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            selectedOrder.paymentStatus === 'PAID'
                              ? 'bg-primary/15 text-secondary'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {selectedOrder.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-base-content/70">Trạng thái đơn hàng:</span>
                        <div>{getStatusBadge(selectedOrder.status)}</div>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.note && (
                    <div className="mt-3 pt-2.5 border-t border-base-300 text-xs">
                      <span className="font-semibold text-base-content/85">Ghi chú từ khách: </span>
                      <span className="text-base-content/80 italic">"{selectedOrder.note}"</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PHẦN 2: BẢNG CHI TIẾT SẢN PHẨM TRONG HÓA ĐƠN */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-base-content/85 mb-2.5 flex items-center gap-1.5">
                  <Package size={15} className="text-secondary" /> Chi tiết các sản phẩm
                </h4>

                <div className="border border-base-300 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-base-300 text-base-content/85 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">STT</th>
                        <th className="px-4 py-3 min-w-[220px]">Sản phẩm</th>
                        <th className="px-4 py-3 text-center">Phân loại</th>
                        <th className="px-4 py-3 text-right">Đơn giá</th>
                        <th className="px-4 py-3 text-center">Số lượng</th>
                        <th className="px-4 py-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-300 bg-base-100">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-base-200/80 transition-colors">
                          <td className="px-4 py-3 text-base-content/60 font-mono text-center w-12">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Link
                                to={`/product/${item.productId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded border border-base-300 overflow-hidden shrink-0 bg-base-200"
                              >
                                <ProductImage
                                  src={item.productImageUrl}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              </Link>
                              <div>
                                <Link
                                  to={`/product/${item.productId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-base-content hover:text-secondary line-clamp-2 inline-flex items-center gap-1 group/name"
                                >
                                  <span>{item.productName}</span>
                                  <ExternalLink size={10} className="text-base-content/60 group-hover/name:text-secondary" />
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-base-content/80">
                            {item.variantName ? (
                              <span className="bg-base-300 text-base-content/85 px-2 py-0.5 rounded text-[11px] font-medium">
                                {item.variantName}
                              </span>
                            ) : (
                              <span className="text-base-content/60">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-base-content/85">
                            ₫{item.productPrice?.toLocaleString('vi-VN')}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-base-content">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-base-content font-mono">
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
                <div className="w-full sm:w-80 space-y-2 p-4 bg-base-200 rounded-xl border border-base-300">
                  <div className="flex justify-between text-xs text-base-content/80">
                    <span>Tiền hàng tạm tính:</span>
                    <span className="font-semibold text-base-content">
                      ₫{selectedOrder.totalAmount?.toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-base-content/80">
                    <span>Phí vận chuyển:</span>
                    <span className="font-semibold text-secondary">Miễn phí</span>
                  </div>
                  <div className="pt-2 border-t border-base-300 flex justify-between items-center">
                    <span className="font-bold text-sm text-base-content">Tổng thanh toán:</span>
                    <span className="font-black text-lg text-secondary font-mono">
                      ₫{selectedOrder.totalAmount?.toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- FOOTER MODAL (CÁC THAO TÁC) --- */}
            <div className="px-6 py-4 bg-base-200 border-t border-base-300 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-base-content/70 italic">
                * Hóa đơn này là căn cứ giao dịch giữa người mua và shop.
              </div>

              <div className="flex items-center gap-3">
                {selectedOrder.status === 'PENDING' && (selectedOrder.paymentMethod !== 'ZALOPAY' || selectedOrder.paymentStatus === 'PAID') && (
                  <button
                    onClick={() => {
                      void handleAction(selectedOrder.id, 'Xác nhận & Chuẩn bị hàng', 'confirm');
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle size={15} /> Xác nhận & Chuẩn bị hàng
                  </button>
                )}

                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    onClick={() => {
                      void handleAction(selectedOrder.id, 'Giao cho đơn vị vận chuyển', 'ship');
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Truck size={15} /> Bàn giao vận chuyển
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-base-100 hover:bg-base-300 text-base-content/85 border border-gray-300 text-xs font-semibold rounded-lg transition-colors"
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