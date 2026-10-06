import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users, DollarSign, BarChart2, Shield, LogOut, Home, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';
import { logout } from '../../store/slice/authSlice';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout').catch(() => { });
      dispatch(logout());
      toast.success('Đã đăng xuất thành công');
      navigate('/login');
    } catch (error) {
      toast.error('Lỗi khi đăng xuất');
    }
  };

  const MENU_ITEMS = [
    { path: '/admin/dashboard', icon: <BarChart2 size={18} />, label: 'Thống kê tổng quan' },
    { path: '/admin/users', icon: <Users size={18} />, label: 'Quản lý người dùng' },
    { path: '/admin/commissions', icon: <DollarSign size={18} />, label: 'Quản lý hoa hồng sàn' },
    { path: '/admin/settings', icon: <Settings size={18} />, label: 'Cài đặt hệ thống' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-gray-800 font-sans flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-[#3b82f6]" size={28} />
            <h1 className="text-xl font-bold text-[#3b82f6]">Admin Portal</h1>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-gray-500 hover:text-[#3b82f6] hidden md:block transition-colors">
              Trang chủ Shopee
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                  <img
                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=random`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium text-gray-700 hidden md:block">
                  {user?.fullName || 'Admin'}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-2 z-50 animate-fade-in origin-top-right">
                  <Link
                    to="/"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#3b82f6] transition-colors"
                  >
                    <Home size={16} /> Trang người mua
                  </Link>

                  <div className="h-px bg-gray-100 my-1"></div> 

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#3b82f6] transition-colors"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="w-full flex gap-5 py-5 px-6 flex-1 items-start">
        <aside className="w-[240px] shrink-0 bg-white border border-gray-200 rounded-xl p-4 shadow-sm sticky top-20 flex flex-col gap-4">
          <nav>
            <ul className="flex flex-col gap-2">
              {MENU_ITEMS.map((item, idx) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                <li key={idx}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition-colors ${isActive
                        ? 'bg-[#eff6ff] text-[#3b82f6] font-bold border border-blue-100'
                        : 'hover:bg-gray-50 text-gray-700 font-medium'
                      }`}
                  >
                    {item.icon} {item.label}
                  </Link>
                </li>
              )})}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
