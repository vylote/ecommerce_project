import formatMoney from "../../shared/utils/formatCurrency";
import FormInput from "../../shared/ui/FormInput";
import FormSelect from "../../shared/ui/FormSelect";
import Dialog from "../../shared/ui/Dialog";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, Percent, Settings2, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import Pagination from '../../shared/components/Pagination';

export default function CommissionPage() {
  const [stats, setStats] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadVersion, setReloadVersion] = useState(0);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [savingConfig, setSavingConfig] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newFee, setNewFee] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function loadCommissionData() {
      try {
        const [statsRes, configsRes, catRes] = await Promise.all([
          api.get('/commission/stats/admin', { signal }),
          api.get('/commission/configs', { signal }),
          api.get('/categories', { signal }),
        ]);
        if (signal.aborted) return;

        const categoryResult = catRes.data?.result;
        setStats(statsRes.data.result);
        setConfigs(configsRes.data.result);
        setCategories(Array.isArray(categoryResult) ? categoryResult : (categoryResult?.data ?? []));
      } catch {
        if (!signal.aborted) toast.error('Không thể tải dữ liệu hoa hồng');
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }

    void loadCommissionData();
    return () => controller.abort();
  }, [reloadVersion]);

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    if (!newFee || Number.isNaN(Number(newFee)) || Number(newFee) < 0 || Number(newFee) > 100) {
      return toast.error('Vui lòng nhập phần trăm hợp lệ (0-100)');
    }
    if (!selectedCategory) {
      return toast.error('Vui lòng chọn danh mục áp dụng');
    }

    if (savingConfig) return;
    setSavingConfig(true);
    try {
      await api.post('/commission/configs', {
        rate: Number(newFee) / 100, // API nhận rate dưới dạng số thập phân (5% = 0.05)
        categoryId: Number(selectedCategory),
        effectiveFrom: effectiveDate
      });
      toast.success('Cập nhật cấu hình hoa hồng thành công!');
      setShowConfigModal(false);
      setNewFee('');
      setLoading(true);
      setReloadVersion((version) => version + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật cấu hình');
    } finally {
      setSavingConfig(false);
    }
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : `Danh mục ${id}`;
  };

  const totalPages = Math.ceil(configs.length / pageSize) || 1;
  const page = Math.min(currentPage, totalPages);
  const paginatedConfigs = configs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="w-full animate-fade-in flex flex-col gap-6">
      
      {/* 1. THỐNG KÊ TỔNG QUAN */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-blue-500" />
            Thống Kê Sàn Giao Dịch
          </h2>
          <Link
            to="/admin"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Xem đồ thị phân tích chu kỳ →
          </Link>
        </div>
        
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
                paginatedConfigs.map((c) => (
                  <tr key={c.categoryId} className="hover:bg-gray-50">
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

        {/* Thanh phân trang */}
        {!loading && configs.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={configs.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 10, 20]}
 />
          </div>
        )}
      </div>

      {/* Modal Cập Nhật Hoa Hồng */}
      {showConfigModal && (
        <Dialog title="Cập Nhật Phí Hoa Hồng" onClose={() => setShowConfigModal(false)} size="md" busy={savingConfig}>
          <form onSubmit={handleUpdateConfig} className="p-5">
            <div className="mb-4">
              <label htmlFor="commission-category" className="block text-sm font-medium text-gray-700 mb-1">
                Chọn Danh Mục
              </label>
              <FormSelect
                id="commission-category"
                className="w-full"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="" disabled>-- Chọn danh mục --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </FormSelect>
            </div>

            <div className="mb-4">
              <label htmlFor="commission-rate" className="block text-sm font-medium text-gray-700 mb-1">
                Mức phí sàn (%)
              </label>
              <div className="relative">
                <FormInput
                  id="commission-rate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  placeholder="Ví dụ: 5.0"
                  focusColor="blue" className="w-full pr-8 focus:ring-1 focus:ring-blue-500"
                  required
 />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="commission-effective-date" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày áp dụng
              </label>
              <FormInput
                id="commission-effective-date"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full"
                required
 />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Lưu ý: Mức phí này sẽ được áp dụng cho danh mục được chọn kể từ ngày thiết lập.
            </p>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button" disabled={savingConfig}
                onClick={() => setShowConfigModal(false)}
                className="btn btn-sm btn-ghost"
              >
                Hủy
              </button>
              <button
                type="submit" disabled={savingConfig}
                className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white border-none"
              >
                Lưu cấu hình
              </button>
            </div>
          </form>
        </Dialog>
      )}

    </div>
  );
}
