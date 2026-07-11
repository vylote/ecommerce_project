import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';
import Navbar from '../../shared/components/Navbar';
import { Store } from 'lucide-react'; // Thêm icon cho đẹp

const TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const STATUS_LABEL = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('ALL');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const fetchOrders = async (pageToLoad) => {
    try {
      setLoading(true);
      const res = await api.get('/orders', { params: { page: pageToLoad, size: 10 } });
      setOrders(res.data.result.data || []);
      setTotalPages(res.data.result.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = activeTab === 'ALL'
    ? orders
    : orders.filter(order => order.status === activeTab);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;
    try {
      setProcessingId(orderId);
      await api.patch(`/orders/${orderId}/cancel`);
      toast.success('Đã hủy đơn hàng');
      fetchOrders(page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (orderId) => {
    if (!window.confirm('Xác nhận đã nhận được hàng?')) return;
    try {
      setProcessingId(orderId);
      await api.patch(`/orders/${orderId}/complete`);
      toast.success('Đã xác nhận hoàn tất đơn hàng');
      fetchOrders(page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hoàn tất đơn hàng');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-10">
      <Navbar />

      <div className="max-w-[1200px] mx-auto py-6 flex gap-5">
        {/* Sidebar */}
        <div className="w-48 shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=random`}
              alt="avatar"
              className="w-12 h-12 rounded-full border border-gray-200"
            />
            <div>
              <div className="font-semibold text-sm text-gray-800 line-clamp-1">{user?.fullName}</div>
              <Link to="/profile" className="text-xs text-gray-500 hover:text-[#ee4d2d]">Sửa hồ sơ</Link>
            </div>
          </div>
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link to="/profile" className="py-2 text-gray-700 hover:text-[#ee4d2d]">Tài khoản của tôi</Link>
            <Link to="/orders" className="py-2 text-[#ee4d2d]">Đơn Mua</Link>
            <span className="py-2 text-gray-400 cursor-not-allowed">Kho Voucher</span>
            <span className="py-2 text-gray-400 cursor-not-allowed">Shopee Xu</span>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex bg-white rounded-sm shadow-sm mb-4">
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${
                  activeTab === tab.value
                    ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d]'
                    : 'text-gray-700 hover:text-[#ee4d2d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-sm shadow-sm">Đang tải đơn hàng...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-sm shadow-sm text-gray-500 flex flex-col items-center justify-center">
              <div className="text-6xl opacity-30 mb-4">🛒</div>
              Chưa có đơn hàng nào{activeTab !== 'ALL' ? ` ở trạng thái "${STATUS_LABEL[activeTab]}"` : ''}.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map(order => {
                // SỬA LỖI 1: Lấy shopName thẳng từ OrderResponse
                const shopLabel = order.shopName || `Đơn #${order.id}`;
                
                return (
                  <div key={order.id} className="bg-white rounded-sm shadow-sm">
                    {/* Header đơn */}
                    <div className="flex justify-between items-center px-6 py-4 border-b">
                      <div className="flex items-center gap-2 font-medium text-sm text-gray-800">
                        <span className="bg-[#ee4d2d] text-white text-xs px-1.5 py-0.5 rounded-sm">Yêu Thích</span>
                        {shopLabel}
                        <button className="bg-primary/10 text-primary border border-primary px-2 py-0.5 text-xs rounded-sm flex items-center gap-1 hover:bg-primary/20 transition-colors ml-2">
                          <Store size={12} /> Xem Shop
                        </button>
                      </div>
                      <span className={`text-sm font-medium uppercase ${
                        order.status === 'COMPLETED' ? 'text-green-600' : 
                        order.status === 'CANCELLED' ? 'text-gray-500' : 'text-[#ee4d2d]'
                      }`}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </div>

                    {/* Danh sách sản phẩm trong đơn */}
                    <div className="divide-y divide-gray-100 cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                          <div className="w-20 h-20 border shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                            {/* SỬA LỖI 2: Dùng productImageUrl thay vì imageUrl */}
                            {item.productImageUrl ? (
                              <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">📦</span>
                            )}
                          </div>
                          <div className="flex-1 text-sm">
                            <div className="line-clamp-2 text-gray-800 text-base">{item.productName}</div>
                            <div className="text-gray-500 mt-2">x{item.quantity}</div>
                          </div>
                          <div className="text-sm shrink-0 flex gap-2 items-center">
                            <span className="text-[#ee4d2d]">₫{item.productPrice?.toLocaleString('vi-VN')}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tổng tiền + hành động */}
                    <div className="bg-[#fffefb] px-6 py-5 border-t flex flex-col items-end">
                      <div className="text-sm mb-5 flex items-center">
                        <span className="text-gray-600 mr-2">Thành tiền:</span>
                        <span className="font-medium text-[#ee4d2d] text-2xl">
                          ₫{order.totalAmount?.toLocaleString('vi-VN')}
                        </span>
                      </div>
                      
                      <div className="flex gap-3">
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            disabled={processingId === order.id}
                            className="w-40 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            Hủy Đơn Hàng
                          </button>
                        )}
                        {order.status === 'SHIPPING' && (
                          <button
                            onClick={() => handleComplete(order.id)}
                            disabled={processingId === order.id}
                            className="w-40 py-2 text-sm bg-[#ee4d2d] text-white rounded-sm hover:bg-[#d73211] transition-colors disabled:opacity-50"
                          >
                            Đã Nhận Hàng
                          </button>
                        )}
                        {order.status === 'COMPLETED' && (
                          <button
                            className="w-40 py-2 text-sm text-[#ee4d2d] bg-white border border-[#ee4d2d] rounded-sm hover:bg-orange-50 transition-colors"
                          >
                            Đánh Giá
                          </button>
                        )}
                        {order.status === 'CANCELLED' && (
                          <button
                            onClick={() => navigate(`/product/${order.items?.[0]?.productId}`)}
                            className="w-40 py-2 text-sm text-[#ee4d2d] bg-white border border-[#ee4d2d] rounded-sm hover:bg-orange-50 transition-colors"
                          >
                            Mua Lại
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="join shadow-sm">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="join-item btn btn-sm bg-white border-gray-300 hover:bg-gray-100 text-gray-600"
                >
                  «
                </button>
                <button className="join-item btn btn-sm bg-[#ee4d2d] text-white border-[#ee4d2d] hover:bg-[#ee4d2d]">
                  Trang {page} / {totalPages}
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="join-item btn btn-sm bg-white border-gray-300 hover:bg-gray-100 text-gray-600"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}