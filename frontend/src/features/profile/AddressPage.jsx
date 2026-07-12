import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';
import Navbar from '../../shared/components/Navbar';
import ProfileSidebar from './ProfileSidebar';
import { Plus } from 'lucide-react';

const formatAddress = (addr) => {
  if (!addr) return '';
  return [addr.detail, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');
};

export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/addresses');
      setAddresses(res.data.result || []);
    } catch (error) {
      toast.error('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
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
            <button className="bg-[#ee4d2d] hover:bg-[#d73211] text-white px-4 py-2 rounded-sm text-sm font-medium flex items-center gap-1 transition-colors">
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
                      <button className="text-blue-600 hover:underline">Cập nhật</button>
                      {!addr.isDefault && (
                        <button className="text-blue-600 hover:underline">Xóa</button>
                      )}
                    </div>
                    <button 
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
    </div>
  );
}