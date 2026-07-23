import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Eye, CheckCircle, Truck, XCircle } from 'lucide-react';
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

  const page = parseInt(searchParams.get('page') || '1', 10);
  const currentStatus = searchParams.get('status') || 'ALL';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (currentStatus !== 'ALL') {
        params.status = currentStatus;
      }
      // Nếu Backend của bạn hỗ trợ tìm kiếm bằng keyword, thêm vào đây

      const res = await api.get('/orders/seller', { params });
      const pageResponse = res.data.result;
      
      setOrders(pageResponse.data);
      setPageInfo({
        currentPage: pageResponse.currentPage,
        totalPages: pageResponse.totalPages,
      });
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, currentStatus]);

  const updateParams = (newParams) => {
    const current = Object.fromEntries([...searchParams]);
    const updated = { ...current, ...newParams };
    Object.keys(updated).forEach(key => {
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
      fetchOrders(); // Reload lại bảng
    } catch (error) {
      toast.error(error.response?.data?.message || `Lỗi khi ${actionName}`);
    }
  };

  // --- TIỆN ÍCH HIỂN THỊ ---
  const getCustomerInfo = (order) => {
    try {
      if (order.addressSnapshot) {
        const addr = JSON.parse(order.addressSnapshot);
        return (
          <div className="text-sm">
            <div className="font-semibold text-gray-800">{addr.receiverName}</div>
            <div className="text-gray-500">{addr.phone}</div>
            <div className="text-xs text-gray-400 mt-1 line-clamp-2" title={`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`}>
              {addr.province}
            </div>
          </div>
        );
      }
    } catch (e) {
      console.error("Lỗi parse địa chỉ");
    }
    return <div className="text-sm font-medium">{order.buyer?.fullName || 'Khách hàng'}</div>;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-sm">MỚI</span>;
      case 'CONFIRMED': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-sm">CHỜ LẤY HÀNG</span>;
      case 'SHIPPING': return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-sm">ĐANG GIAO</span>;
      case 'COMPLETED': return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-sm">THÀNH CÔNG</span>;
      case 'CANCELLED': return <span className="px-2.5 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-sm">ĐÃ HỦY</span>;
      default: return null;
    }
  };

  return (
    <div className="pb-20 animate-fade-in w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Đơn hàng</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form className="relative flex-1 md:w-[300px]" onSubmit={(e) => { e.preventDefault(); /* Tương lai tích hợp search keyword */ }}>
            <input 
              type="text" 
              placeholder="Nhập Mã đơn hàng..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input input-bordered input-sm w-full pl-9 focus:border-[#ee4d2d]"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden w-full">
        {/* --- TABS --- */}
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map(tab => (
            <button 
              key={tab.id}
              onClick={() => updateParams({ status: tab.id, page: 1 })}
              className={`px-6 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                currentStatus === tab.id 
                  ? 'border-[#ee4d2d] text-[#ee4d2d]' 
                  : 'border-transparent text-gray-600 hover:text-[#ee4d2d]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- TABLE --- */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-5 py-4 w-32">Mã đơn</th>
                <th className="px-5 py-4 w-48">Khách hàng</th>
                <th className="px-5 py-4 min-w-[300px]">Sản phẩm</th>
                <th className="px-5 py-4 text-right w-32">Tổng tiền</th>
                <th className="px-5 py-4 text-center w-32">Trạng thái</th>
                <th className="px-5 py-4 text-center w-40">Thao tác</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10"><span className="loading loading-spinner text-primary"></span></td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-gray-500">
                    <div className="text-4xl mb-3 opacity-50">📦</div>
                    <p>Không có đơn hàng nào.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-5 py-4 align-top font-medium text-gray-800">
                      #{order.id}
                      <div className="text-[11px] text-gray-400 font-normal mt-1">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      {getCustomerInfo(order)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-col gap-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-3">
                            <img 
                              src={item.productImageUrl || 'https://via.placeholder.com/40'} 
                              alt="product" 
                              className="w-10 h-10 object-cover border border-gray-200 rounded-sm shrink-0"
                            />
                            <div>
                              <div className="text-gray-800 line-clamp-2 leading-tight">{item.productName}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                ₫{item.productPrice?.toLocaleString('vi-VN')} <span className="font-medium px-1">x</span> {item.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      <div className="font-bold text-[#ee4d2d] text-base">
                        ₫{order.totalAmount?.toLocaleString('vi-VN')}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">Đã tính phí ship</div>
                    </td>
                    <td className="px-5 py-4 align-top text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-5 py-4 align-top text-center">
                      <div className="flex flex-col gap-2 items-center">
                        {/* HIỂN THỊ NÚT THAO TÁC ĐỘNG THEO TRẠNG THÁI */}
                        {order.status === 'PENDING' && (
                          <button 
                            onClick={() => handleAction(order.id, 'Xác nhận', 'confirm')}
                            className="btn btn-sm w-full bg-[#ee4d2d] hover:bg-[#d73211] text-white border-none font-normal"
                          >
                            <CheckCircle size={14} className="mr-1" /> Chuẩn bị hàng
                          </button>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <button 
                            onClick={() => handleAction(order.id, 'Giao', 'ship')}
                            className="btn btn-sm w-full bg-blue-600 hover:bg-blue-700 text-white border-none font-normal"
                          >
                            <Truck size={14} className="mr-1" /> Giao ĐVVC
                          </button>
                        )}
                        <Link 
                          to={`/seller/order/${order.id}`} // Tương lai: Làm trang chi tiết đơn
                          className="btn btn-sm w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-normal"
                        >
                          <Eye size={14} className="mr-1" /> Chi tiết
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        {!loading && pageInfo.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end">
            <div className="join gap-1">
              <button disabled={page === 1} onClick={() => updateParams({ page: page - 1 })} className="join-item btn btn-sm bg-white border-gray-300 text-gray-600 hover:bg-gray-50">«</button>
              {Array.from({ length: pageInfo.totalPages }).map((_, idx) => (
                <button key={idx + 1} onClick={() => updateParams({ page: idx + 1 })} className={`join-item btn btn-sm border-gray-300 w-8 h-8 rounded-sm font-medium text-sm ${page === idx + 1 ? 'bg-[#ee4d2d] text-white border-[#ee4d2d] hover:bg-[#d73211]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  {idx + 1}
                </button>
              ))}
              <button disabled={page === pageInfo.totalPages} onClick={() => updateParams({ page: page + 1 })} className="join-item btn btn-sm bg-white border-gray-300 text-gray-600 hover:bg-gray-50">»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}