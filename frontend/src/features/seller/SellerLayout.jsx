import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package, ShoppingBag, Megaphone, MessageSquare,
  DollarSign, BarChart2, Store, LogOut, Home, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';
import { logout } from '../../store/slice/authSlice';
import { useNotification } from '../../shared/hooks/useNotification.jsx';

export default function SellerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy thông tin user từ Redux để hiển thị Avatar thật
  const { user } = useSelector((state) => state.auth);

  // Hook thông báo thời gian thực
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification(user?.id);

  // --- STATE QUẢN LÝ DROPDOWN ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Tự động đóng dropdown khi click ra ngoài vùng menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- HÀM XỬ LÝ ĐĂNG XUẤT ---
  const handleLogout = async () => {
    try {
      // Gọi API xóa session/cookie dưới Backend (Nếu bạn có API này)
      await api.post('/auth/logout').catch(() => { });

      // Xóa state trong Redux
      dispatch(logout());

      toast.success('Đã đăng xuất thành công');
      navigate('/login');
    } catch (error) {
      toast.error('Lỗi khi đăng xuất');
    }
  };

  const MENU_ITEMS = [
    { path: '/seller/profile', icon: <Store size={18} />, label: 'Hồ sơ Shop', isImplemented: true },
    { path: '/seller/orders', icon: <Package size={18} />, label: 'Quản lý đơn hàng', isImplemented: true },
    { path: '/seller/products', icon: <ShoppingBag size={18} />, label: 'Quản lý sản phẩm', isImplemented: true },
    { path: '/seller/product/add', icon: <Store size={18} />, label: 'Thêm sản phẩm', isImplemented: true },
    { path: '/seller/marketing', icon: <Megaphone size={18} />, label: 'Kênh Marketing', isImplemented: false },
    { path: '/seller/chat', icon: <MessageSquare size={18} />, label: 'Chăm sóc khách hàng', isImplemented: false },
    { path: '/seller/finance', icon: <DollarSign size={18} />, label: 'Tài chính', isImplemented: false },
    { path: '/seller/data', icon: <BarChart2 size={18} />, label: 'Dữ liệu', isImplemented: false },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-gray-800 font-sans flex flex-col">
      {/* ================= HEADER SELLER ================= */}
      <header className="bg-gradient-to-r from-green-600 to-green-500 shadow-sm sticky top-0 z-50 text-white">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-2xl font-black text-white tracking-wider">
              ECOMMERCE
            </Link>
            <span className="w-px h-6 bg-white/40" />
            <div className="flex items-center gap-2">
              <Store className="text-white" size={22} />
              <h1 className="text-lg font-bold text-white">Kênh Người Bán</h1>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-white/85 hover:text-white hidden md:flex items-center gap-1.5 transition-colors font-medium">
              <Home size={16} />
              Trang người mua
            </Link>

            {/* ================= KHU VỰC THÔNG BÁO DROPDOWN ================= */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative flex items-center gap-1.5 text-white/90 hover:text-white transition-colors focus:outline-none p-1.5 rounded-full hover:bg-white/10"
                title="Thông báo"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center ring-2 ring-green-600 animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white text-gray-800 border border-gray-100 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] z-50 overflow-hidden origin-top-right">
                  <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">Thông báo Người Bán</span>
                      {unreadCount > 0 && (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {unreadCount} mới
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-green-600 hover:text-green-700 font-medium hover:underline"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-sm">
                        <span className="text-3xl block mb-2">📭</span>
                        Chưa có thông báo nào
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((notif) => (
                        <div
                          key={notif.id || Math.random()}
                          onClick={() => {
                            if (!notif.isRead && notif.id) markAsRead(notif.id);
                            setIsNotifOpen(false);
                            navigate('/seller/orders');
                          }}
                          className={`p-3.5 flex gap-3 items-start hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notif.isRead ? 'bg-green-50/40' : ''
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5 text-base">
                            {notif.type === 'NEW_ORDER' ? '🛒' : notif.type === 'PAYMENT_SUCCESS' ? '💰' : notif.type === 'ORDER_CANCELLED' ? '❌' : '🔔'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-gray-900 line-clamp-1">{notif.title}</p>
                              {!notif.isRead && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-gray-100 text-center bg-gray-50/50">
                    <Link
                      to="/seller/orders"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-xs font-semibold text-green-700 hover:text-green-800"
                    >
                      Xem danh sách đơn hàng →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ================= KHU VỰC AVATAR DROPDOWN ================= */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 focus:outline-none hover:opacity-90 transition-opacity"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full overflow-hidden border border-white/40">
                  <img
                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Seller')}&background=random`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Hiện tên Shop/Seller nếu màn hình đủ rộng */}
                <span className="font-medium text-white hidden md:block">
                  {user?.fullName || 'Seller'}
                </span>
              </button>

              {/* MENU DROPDOWN (Chỉ hiện khi isDropdownOpen = true) */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white text-gray-800 border border-gray-100 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-2 z-50 animate-fade-in origin-top-right">
                  <Link
                    to="/"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    <Home size={16} /> Trang người mua
                  </Link>

                  <div className="h-px bg-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
            {/* ================= KẾT THÚC AVATAR DROPDOWN ================= */}

          </div>
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className="w-full flex gap-5 py-5 px-6 flex-1 items-start">

        {/* SIDEBAR DÙNG CHUNG CHỨA MENU */}
        <aside className="w-[240px] shrink-0 bg-white border border-gray-200 rounded-xl p-4 shadow-sm sticky top-20 flex flex-col gap-4">
          <nav>
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/seller/dashboard" className={`flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/seller/dashboard' ? 'bg-green-50 text-green-700 font-bold border border-green-200' : 'hover:bg-green-50/60 hover:text-green-700 text-gray-700'}`}>
                  <BarChart2 size={18} /> Tổng quan
                </Link>
              </li>
              {MENU_ITEMS.map((item, idx) => (
                <li key={idx}>
                  {item.isImplemented ? (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition-colors ${location.pathname.startsWith(item.path)
                          ? 'bg-green-50 text-green-700 font-bold border border-green-200'
                          : 'hover:bg-green-50/60 hover:text-green-700 text-gray-700 font-medium'
                        }`}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => toast('Tính năng đang phát triển. Vui lòng quay lại sau!', { icon: '🚧' })}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg text-sm transition-colors hover:bg-gray-50 text-gray-400 font-medium opacity-80 cursor-not-allowed text-left"
                    >
                      {item.icon} {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-2 border border-gray-100 p-3 rounded-lg bg-gray-50">
            <div className="font-bold text-sm mb-2 text-gray-800">Danh sách cần làm</div>
            <div className="flex gap-2 flex-wrap">
              <div className="bg-white border border-gray-200 p-2 rounded-lg flex-1 min-w-[45%]">
                <div className="font-bold text-green-600 text-lg">85</div>
                <div className="text-xs text-gray-500">Chờ lấy hàng</div>
              </div>
              <div className="bg-white border border-gray-200 p-2 rounded-lg flex-1 min-w-[45%]">
                <div className="font-bold text-lg text-gray-800">12</div>
                <div className="text-xs text-gray-500">Đơn mới</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}