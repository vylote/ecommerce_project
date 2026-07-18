import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, ShoppingBag, Megaphone, MessageSquare, DollarSign, BarChart2, Store } from 'lucide-react';

export default function SellerLayout() {
  const location = useLocation();

  const MENU_ITEMS = [
    { path: '/seller/orders', icon: <Package size={18} />, label: 'Quản lý đơn hàng' },
    { path: '/seller/products', icon: <ShoppingBag size={18} />, label: 'Quản lý sản phẩm' },
    { path: '/seller/product/add', icon: <Store size={18} />, label: 'Thêm sản phẩm' }, // Link tạm
    { path: '/seller/marketing', icon: <Megaphone size={18} />, label: 'Kênh Marketing' },
    { path: '/seller/chat', icon: <MessageSquare size={18} />, label: 'Chăm sóc khách hàng' },
    { path: '/seller/finance', icon: <DollarSign size={18} />, label: 'Tài chính' },
    { path: '/seller/data', icon: <BarChart2 size={18} />, label: 'Dữ liệu' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-gray-800 font-sans flex flex-col">
      {/* ================= HEADER SELLER ================= */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="text-[#ee4d2d]" size={28} />
            <h1 className="text-xl font-bold text-[#ee4d2d]">Kênh Người Bán</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-gray-500 hover:text-[#ee4d2d]">Trang chủ Shopee</Link>
            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Seller&background=random" alt="Avatar" />
            </div>
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
                <Link to="/seller/dashboard" className={`flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/seller/dashboard' ? 'bg-[#fff3f1] text-[#ee4d2d] border border-orange-100' : 'hover:bg-gray-50 text-gray-700'}`}>
                  <BarChart2 size={18} /> Tổng quan
                </Link>
              </li>
              {MENU_ITEMS.map((item, idx) => (
                <li key={idx}>
                  <Link 
                    to={item.path} 
                    className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition-colors ${
                      location.pathname.startsWith(item.path) 
                        ? 'bg-[#fff3f1] text-[#ee4d2d] font-bold border border-orange-100' 
                        : 'hover:bg-gray-50 text-gray-700 font-medium'
                    }`}
                  >
                    {item.icon} {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-2 border border-gray-100 p-3 rounded-lg bg-gray-50">
            <div className="font-bold text-sm mb-2">Danh sách cần làm</div>
            <div className="flex gap-2 flex-wrap">
              <div className="bg-white border border-gray-200 p-2 rounded-lg flex-1 min-w-[45%]">
                <div className="font-bold text-[#ee4d2d] text-lg">85</div>
                <div className="text-xs text-gray-500">Chờ lấy hàng</div>
              </div>
              <div className="bg-white border border-gray-200 p-2 rounded-lg flex-1 min-w-[45%]">
                <div className="font-bold text-lg">12</div>
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