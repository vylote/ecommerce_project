import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';
import Navbar from '../../shared/components/Navbar';
import ProfileSidebar from './ProfileSidebar';
import { Plus, X } from 'lucide-react';

const formatAddress = (addr) => {
  if (!addr) return '';
  return [addr.detail, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');
};

const INITIAL_FORM_STATE = {
  fullName: '',
  phone: '',
  province: '',
  district: '',
  ward: '',
  detail: '',
  isDefault: false
};

export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Nếu null -> Thêm mới, có ID -> Cập nhật
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/addresses');
      // Backend tự sắp xếp, nhưng ta có thể ép địa chỉ mặc định lên đầu mảng
      const list = res.data.result || [];
      list.sort((a, b) => (b.isDefault === true ? 1 : 0) - (a.isDefault === true ? 1 : 0));
      setAddresses(list);
    } catch (error) {
      toast.error('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS MỞ MODAL ---
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingId(addr.id);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      detail: addr.detail,
      isDefault: addr.isDefault
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM_STATE);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // --- API HANDLERS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        // Cập nhật
        await api.put(`/addresses/${editingId}`, formData);
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        // Thêm mới
        await api.post('/addresses', formData);
        toast.success('Thêm địa chỉ mới thành công');
      }
      handleCloseModal();
      fetchAddresses(); // Refresh danh sách
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      toast.success('Đã xóa địa chỉ');
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa địa chỉ');
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      // Gửi lại nguyên data của địa chỉ đó nhưng set isDefault = true
      // Theo code BE của bạn, nó sẽ tự động chạy hàm resetDefaultAddress cho các địa chỉ cũ
      await api.put(`/addresses/${addr.id}`, { ...addr, isDefault: true });
      toast.success('Đã thiết lập làm địa chỉ mặc định');
      fetchAddresses();
    } catch (error) {
      toast.error('Không thể thiết lập mặc định');
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-10">
      <Navbar />
      <div className="max-w-[1200px] mx-auto py-6 flex gap-5">
        <ProfileSidebar />

        <div className="flex-1 bg-white rounded-sm shadow-sm p-8">
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h1 className="text-xl font-medium text-gray-800">Địa chỉ của tôi</h1>
            <button 
              onClick={handleOpenAddModal}
              className="bg-[#ee4d2d] hover:bg-[#d73211] text-white px-4 py-2 rounded-sm text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <Plus size={16} /> Thêm địa chỉ mới
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Đang tải địa chỉ...</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Bạn chưa có địa chỉ nào.</div>
          ) : (
            <div className="space-y-0">
              {addresses.map((addr) => (
                <div key={addr.id} className="py-5 border-b border-gray-100 last:border-0 flex justify-between items-start">
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800 text-base">{addr.fullName}</span>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <span className="text-gray-500">{addr.phone}</span>
                    </div>
                    <div className="text-gray-600 mb-1">{addr.detail}</div>
                    <div className="text-gray-600 mb-2">{addr.ward}, {addr.district}, {addr.province}</div>
                    {addr.isDefault && (
                      <span className="border border-[#ee4d2d] text-[#ee4d2d] text-xs px-2 py-0.5 rounded-sm">
                        Mặc định
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 text-sm">
                    <div className="space-x-3">
                      <button onClick={() => handleOpenEditModal(addr)} className="text-blue-600 hover:underline">
                        Cập nhật
                      </button>
                      {!addr.isDefault && (
                        <button onClick={() => handleDelete(addr.id)} className="text-blue-600 hover:underline">
                          Xóa
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => handleSetDefault(addr)}
                      disabled={addr.isDefault}
                      className={`px-3 py-1 border rounded-sm transition-colors ${
                        addr.isDefault 
                          ? 'border-gray-200 text-gray-400 bg-white cursor-not-allowed' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Thiết lập mặc định
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* POPUP MODAL THÊM/SỬA ĐỊA CHỈ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-sm w-[500px] shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">
                {editingId ? 'Cập nhật địa chỉ' : 'Địa chỉ mới'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="flex gap-4">
                  <input 
                    type="text" name="fullName" placeholder="Họ và tên" required
                    value={formData.fullName} onChange={handleInputChange}
                    className="w-1/2 border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                  <input 
                    type="text" name="phone" placeholder="Số điện thoại" required
                    value={formData.phone} onChange={handleInputChange}
                    className="w-1/2 border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                </div>

                <div className="flex gap-4">
                  <input 
                    type="text" name="province" placeholder="Tỉnh/Thành phố" required
                    value={formData.province} onChange={handleInputChange}
                    className="w-1/3 border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                  <input 
                    type="text" name="district" placeholder="Quận/Huyện" required
                    value={formData.district} onChange={handleInputChange}
                    className="w-1/3 border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                  <input 
                    type="text" name="ward" placeholder="Phường/Xã" required
                    value={formData.ward} onChange={handleInputChange}
                    className="w-1/3 border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                </div>

                <input 
                  type="text" name="detail" placeholder="Địa chỉ cụ thể (Số nhà, Tên đường...)" required
                  value={formData.detail} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-gray-400"
                />

                <label className="flex items-center gap-2 cursor-pointer mt-4">
                  <input 
                    type="checkbox" name="isDefault" 
                    checked={formData.isDefault} onChange={handleInputChange}
                    className="w-4 h-4 accent-[#ee4d2d]"
                  />
                  <span className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
                </label>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
                <button 
                  type="button" onClick={handleCloseModal}
                  className="px-6 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-100 transition-colors"
                >
                  Trở lại
                </button>
                <button 
                  type="submit" disabled={submitting}
                  className="px-6 py-2 text-sm text-white bg-[#ee4d2d] rounded-sm hover:bg-[#d73211] transition-colors disabled:opacity-70"
                >
                  {submitting ? 'Đang lưu...' : 'Hoàn thành'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}