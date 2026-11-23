import useReloadableRequest from "../../../shared/hooks/useReloadableRequest";
import Dialog, { DialogActions } from "../../../shared/ui/Dialog";
import AddressFields from "./components/AddressFields";
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../../config/api';
import Navbar from '../../../shared/components/Navbar';
import ProfileSidebar from './ProfileSidebar';
import { Plus } from 'lucide-react';
import { useI18n } from '../../../../i18n';

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
  const { t } = useI18n();
  const [addresses, setAddresses] = useState([]);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Nếu null -> Thêm mới, có ID -> Cập nhật
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);

  const loadAddresses = useCallback(async (signal) => {
    const response = await api.get('/addresses', { signal });
    if (signal.aborted) return;

    const list = response.data.result || [];
    setAddresses([...list].sort((a, b) => Number(b.isDefault === true) - Number(a.isDefault === true)));
  }, []);
  const { loading, reload: fetchAddresses } = useReloadableRequest(
    loadAddresses,
    () => toast.error('Không thể tải danh sách địa chỉ'),
  );

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
        toast.success(t('address.update_success'));
      } else {
        // Thêm mới
        await api.post('/addresses', formData);
        toast.success(t('address.add_success'));
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
    if (!window.confirm(t('address.delete_confirm'))) return;
    try {
      await api.delete(`/addresses/${id}`);
      toast.success(t('address.delete_success'));
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
      toast.success(t('address.set_default_success'));
      fetchAddresses();
    } catch {
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
            <h1 className="text-xl font-medium text-gray-800">{t("address.title")}</h1>
            <button 
              onClick={handleOpenAddModal}
              className="bg-[#ee4d2d] hover:bg-[#d73211] text-white px-4 py-2 rounded-sm text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus size={16} /> {t("address.add_new")}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">{t("address.loading")}</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-10 text-gray-500">{t("address.empty")}</div>
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
                        {t("address.default")}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 text-sm">
                    <div className="space-x-3">
                      <button onClick={() => handleOpenEditModal(addr)} className="text-blue-600 hover:underline cursor-pointer">
                        {t("address.update")}
                      </button>
                      {!addr.isDefault && (
                        <button onClick={() => handleDelete(addr.id)} className="text-blue-600 hover:underline cursor-pointer">
                          {t("address.delete")}
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => handleSetDefault(addr)}
                      disabled={addr.isDefault}
                      className={`px-3 py-1 border rounded-sm transition-colors cursor-pointer ${
                        addr.isDefault 
                          ? 'border-gray-200 text-gray-400 bg-white cursor-not-allowed' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {t("address.set_default")}
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
        <Dialog title={editingId ? t("address.modal_edit_title") : t("address.modal_add_title")} onClose={handleCloseModal} busy={submitting}>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <AddressFields value={formData} onChange={handleInputChange} />
              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input
                  type="checkbox" name="isDefault"
                  checked={formData.isDefault} onChange={handleInputChange}
                  className="w-4 h-4 accent-[#ee4d2d]"
                />
                <span className="text-sm text-gray-700">{t("address.set_as_default")}</span>
              </label>
            </div>

            <DialogActions>
              <button
                type="button" disabled={submitting} onClick={handleCloseModal}
                className="px-6 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {t("address.back")}
              </button>
              <button
                type="submit" disabled={submitting}
                className="px-6 py-2 text-sm text-white bg-[#ee4d2d] rounded-sm hover:bg-[#d73211] transition-colors disabled:opacity-70 cursor-pointer"
              >
                {submitting ? t("address.submitting") : t("address.submit")}
              </button>
            </DialogActions>
          </form>
        </Dialog>
      )}

    </div>
  );
}