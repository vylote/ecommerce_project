import useDismissiblePopover from "../../shared/hooks/useDismissiblePopover";
import usePortalLogout from "../../shared/hooks/usePortalLogout";
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Package, ShoppingBag, Megaphone, MessageSquare,
  DollarSign, BarChart2, Store, LogOut, Home
} from 'lucide-react';
import toast from 'react-hot-toast';
import SellerNotificationDropdown from './components/SellerNotificationDropdown';

export default function SellerLayout() {
  const location = useLocation();

  // Lấy thông tin user từ Redux để hiển thị Avatar thật
  const { user } = useSelector((state) => state.auth);

  // --- STATE QUẢN LÝ DROPDOWN AVATAR ---
  const { isOpen: isDropdownOpen, setIsOpen: setIsDropdownOpen, containerRef: dropdownRef } = useDismissiblePopover();
  const handleLogout = usePortalLogout();

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
    <div className="min-h-screen bg-base-200 text-base-content font-sans flex flex-col">
      {/* ================= HEADER SELLER ================= */}
      <header className="bg-gradient-to-r from-primary to-accent shadow-sm sticky top-0 z-50 text-white">
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

          <div className="relative flex items-center gap-6 text-sm">
            <Link to="/" className="text-white/85 hover:text-white hidden md:flex items-center gap-1.5 transition-colors font-medium">
              <Home size={16} />
              Trang người mua
            </Link>

            <SellerNotificationDropdown user={user} />

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
                <div className="absolute right-0 mt-3 w-48 bg-base-100 text-base-content border border-base-300 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-2 z-50 animate-fade-in origin-top-right">
                  <Link
                    to="/"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-base-content/85 hover:bg-primary/10 hover:text-secondary transition-colors"
                  >
                    <Home size={16} /> Trang người mua
                  </Link>

                  <div className="h-px bg-base-300 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-base-content/85 hover:bg-red-50 hover:text-red-600 transition-colors"
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
        <aside className="w-[240px] shrink-0 bg-base-100 border border-base-300 rounded-xl p-4 shadow-sm sticky top-20 flex flex-col gap-4">
          <nav>
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/seller/dashboard" className={`flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/seller/dashboard' ? 'bg-primary/10 text-secondary font-bold border border-primary/25' : 'hover:bg-primary/10 hover:text-secondary text-base-content/85'}`}>
                  <BarChart2 size={18} /> Tổng quan
                </Link>
              </li>
              {MENU_ITEMS.map((item, idx) => (
                <li key={idx}>
                  {item.isImplemented ? (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition-colors ${location.pathname.startsWith(item.path)
                          ? 'bg-primary/10 text-secondary font-bold border border-primary/25'
                          : 'hover:bg-primary/10 hover:text-secondary text-base-content/85 font-medium'
                        }`}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => toast('Tính năng đang phát triển. Vui lòng quay lại sau!', { icon: '🚧' })}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg text-sm transition-colors hover:bg-base-200 text-base-content/60 font-medium opacity-80 cursor-not-allowed text-left"
                    >
                      {item.icon} {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-2 border border-base-300 p-3 rounded-lg bg-base-200">
            <div className="font-bold text-sm mb-2 text-base-content">Danh sách cần làm</div>
            <div className="flex gap-2 flex-wrap">
              <div className="bg-base-100 border border-base-300 p-2 rounded-lg flex-1 min-w-[45%]">
                <div className="font-bold text-secondary text-lg">85</div>
                <div className="text-xs text-base-content/70">Chờ lấy hàng</div>
              </div>
              <div className="bg-base-100 border border-base-300 p-2 rounded-lg flex-1 min-w-[45%]">
                <div className="font-bold text-lg text-base-content">12</div>
                <div className="text-xs text-base-content/70">Đơn mới</div>
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
