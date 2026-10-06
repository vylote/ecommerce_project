import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Percent, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';

export default function CommissionPage() {
  const [stats, setStats] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newFee, setNewFee] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const fetchCommissionData = async () => {
    setLoading(true);
    try {
      const [statsRes, configsRes, catRes] = await Promise.all([
        api.get('/commission/stats/admin'),
        api.get('/commission/configs'),
        api.get('/categories') // Giả sử có API lấy category
      ]);
      setStats(statsRes.data.result);
      setConfigs(configsRes.data.result);
      setCategories(catRes.data.result.data || catRes.data.result || []);
    } catch (error) {
      toast.error('Không thể tải dữ liệu hoa hồng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissionData();
  }, []);

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    if (!newFee || isNaN(newFee) || Number(newFee) < 0 || Number(newFee) > 100) {
      return toast.error('Vui lòng nhập phần trăm hợp lệ (0-100)');
    }
    if (!selectedCategory) {
      return toast.error('Vui lòng chọn danh mục áp dụng');
    }

    try {
      await api.post('/commission/configs', {
        rate: Number(newFee) / 100, // API nhận rate dưới dạng số thập phân (5% = 0.05)
        categoryId: Number(selectedCategory),
        effectiveFrom: effectiveDate
      });
      toast.success('Cập nhật cấu hình hoa hồng thành công!');
      setShowConfigModal(false);
      setNewFee('');
      fetchCommissionData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật cấu hình');
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : `Danh mục ${id}`;
  };

  return (
    <div className="w-full animate-fade-in flex flex-col gap-6">
      
      {/* 1. THỐNG KÊ TỔNG QUAN */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <TrendingUp className="text-blue-500" />
          Thống Kê Sàn Giao Dịch
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-10"><span className="loading loading-spinner text-blue-500"></span></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-green-100 bg-green-50 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <DollarSign size={18} className="text-green-500" />
                Tổng Doanh Thu (Gross)
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {formatMoney(stats?.totalGrossRevenue)}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-orange-100 bg-orange-50 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <Percent size={18} className="text-orange-500" />
                Tổng Hoa Hồng Thu Được
              </div>
              <div className="text-2xl font-bold text-[#ee4d2d]">
                {formatMoney(stats?.totalCommissionRevenue)}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-purple-100 bg-purple-50 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <DollarSign size={18} className="text-purple-500" />
                Thực Nhận Của Shop (Net)
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {formatMoney((stats?.totalGrossRevenue || 0) - (stats?.totalCommissionRevenue || 0))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. CẤU HÌNH HOA HỒNG */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings2 className="text-blue-500" />
            Cấu Hình Hoa Hồng Theo Danh Mục
          </h2>
          <button 
            onClick={() => setShowConfigModal(true)}
            className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white border-none"
          >
            Tạo mức phí mới
          </button>
        </div>

        <div className="overflow-x-auto w-full border border-gray-100 rounded-lg">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-medium">
              <tr>
                <th className="px-5 py-4">Danh Mục</th>
                <th className="px-5 py-4">Mức Phí Sàn (%)</th>
                <th className="px-5 py-4">Ngày Áp Dụng</th>
                <th className="px-5 py-4">Người Tạo (ID)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10"><span className="loading loading-spinner text-blue-500"></span></td></tr>
              ) : configs.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-10 text-gray-500">Chưa có cấu hình hoa hồng nào</td></tr>
              ) : (
                configs.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {getCategoryName(c.categoryId)}
                    </td>
                    <td className="px-5 py-4 font-bold text-blue-600">
                      {(c.rate * 100).toFixed(1)}%
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {c.effectiveFrom}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      ID: {c.createdById}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cập Nhật Hoa Hồng */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-[450px] overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Cập Nhật Phí Hoa Hồng</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleUpdateConfig} className="p-5">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn Danh Mục
                </label>
                <select 
                  className="select select-bordered w-full"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Chọn danh mục --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mức phí sàn (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    placeholder="Ví dụ: 5.0"
                    className="input input-bordered w-full pr-8 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày áp dụng
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Lưu ý: Mức phí này sẽ được áp dụng cho danh mục được chọn kể từ ngày thiết lập.
              </p>

              <div className="flex gap-3 justify-end mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowConfigModal(false)} 
                  className="btn btn-sm btn-ghost"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white border-none"
                >
                  Lưu cấu hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
