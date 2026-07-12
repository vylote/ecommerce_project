import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { User, ClipboardList, Ticket, Coins } from 'lucide-react';

export default function ProfileSidebar() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Xác định xem URL hiện tại có nằm trong nhóm "Tài khoản của tôi" không
  const isProfile = location.pathname === '/profile';
  const isAddress = location.pathname === '/profile/addresses';
  const isAccountGroup = isProfile || isAddress;

  const avatarSrc = user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=random`;

  return (
    <div className="w-56 shrink-0">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shrink-0">
          <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="overflow-hidden">
          <div className="font-semibold text-sm text-gray-800 truncate">
            {user?.fullName || user?.email}
          </div>
          <Link to="/profile" className="text-xs text-gray-500 hover:text-[#ee4d2d] flex items-center gap-1 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Sửa hồ sơ
          </Link>
        </div>
      </div>

      <nav className="flex flex-col gap-4 text-sm font-medium">
        
        {/* GROUP 1: TÀI KHOẢN CỦA TÔI */}
        <div>
          {/* Mục Cha: Click vào sẽ mặc định nhảy về trang Hồ sơ */}
          <Link 
            to="/profile" 
            className={`flex items-center gap-2 mb-2 transition-colors ${
              isAccountGroup ? 'text-[#ee4d2d]' : 'text-gray-800 hover:text-[#ee4d2d]'
            }`}
          >
            <User size={18} className="text-blue-500" />
            <span>Tài khoản của tôi</span>
          </Link>
          
          {/* Các mục Con: Thụt lề bằng pl-7 (padding-left) */}
          <div className="flex flex-col gap-3 pl-7 text-gray-600 font-normal">
            <Link 
              to="/profile" 
              className={`transition-colors ${isProfile ? 'text-[#ee4d2d] font-medium' : 'hover:text-[#ee4d2d]'}`}
            >
              Hồ sơ
            </Link>
            <Link 
              to="/profile/addresses" 
              className={`transition-colors ${isAddress ? 'text-[#ee4d2d] font-medium' : 'hover:text-[#ee4d2d]'}`}
            >
              Địa chỉ
            </Link>
            <span className="text-gray-400 cursor-not-allowed">Đổi mật khẩu</span>
            <span className="text-gray-400 cursor-not-allowed">Ngân hàng</span>
          </div>
        </div>

        {/* GROUP 2: ĐƠN MUA (Root level) */}
        <Link 
          to="/orders" 
          className={`flex items-center gap-2 transition-colors ${
            location.pathname.startsWith('/orders') ? 'text-[#ee4d2d]' : 'text-gray-800 hover:text-[#ee4d2d]'
          }`}
        >
          <ClipboardList size={18} className="text-blue-500" />
          <span>Đơn Mua</span>
        </Link>

        {/* GROUP 3: KHO VOUCHER (Root level) */}
        <div className="flex items-center gap-2 text-gray-800 cursor-not-allowed">
          <Ticket size={18} className="text-[#ee4d2d]" />
          <span>Kho Voucher</span>
        </div>

        {/* GROUP 4: SHOPEE XU (Root level) */}
        <div className="flex items-center gap-2 text-gray-800 cursor-not-allowed">
          <Coins size={18} className="text-yellow-500" />
          <span>Shopee Xu</span>
        </div>
        
      </nav>
    </div>
  );
}