import React from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, Settings2, BarChart2 } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="w-full animate-fade-in flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chào mừng đến với Admin Portal</h2>
        <p className="text-gray-600">Tại đây, bạn có toàn quyền quản trị hệ thống Shopee Clone. Vui lòng chọn các tính năng bên dưới để bắt đầu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Link to="/admin/users" className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 group">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-500 transition-colors">Quản lý người dùng</h3>
            <p className="text-sm text-gray-500">Xem danh sách, phân quyền và khóa/mở khóa tài khoản khách hàng, người bán.</p>
          </div>
        </Link>

        <Link to="/admin/commissions" className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 group">
          <div className="p-3 bg-orange-50 text-[#ee4d2d] rounded-lg group-hover:bg-[#ee4d2d] group-hover:text-white transition-colors">
            <DollarSign size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-[#ee4d2d] transition-colors">Hoa hồng & Thống kê</h3>
            <p className="text-sm text-gray-500">Cấu hình chiết khấu phần trăm phí sàn và xem báo cáo tổng doanh thu.</p>
          </div>
        </Link>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 group cursor-not-allowed opacity-70">
          <div className="p-3 bg-gray-50 text-gray-500 rounded-lg">
            <Settings2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Cài đặt hệ thống</h3>
            <p className="text-sm text-gray-500">Tính năng đang được phát triển. Dùng để tùy chỉnh banner, danh mục...</p>
          </div>
        </div>

      </div>
    </div>
  );
}
