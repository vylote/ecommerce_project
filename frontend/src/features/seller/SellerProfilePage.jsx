import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Store, MapPin, Loader2 } from 'lucide-react';
import api from '../../shared/utils/api';

export default function SellerProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingShop, setLoadingShop] = useState(true);

  const [shopId, setShopId] = useState(null);
  
  const [shopData, setShopData] = useState({
    shopName: '',
    phone: '',
    email: '', // Not strictly in Shop entity usually, but keep for form if needed or omit
    description: '',
    categoryIds: [],
    address: null, // we'll store string here or object, based on how we fetch
    addressText: '', 
    file: null,
    previewUrl: null,
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load Categories & Shop Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCategories(true);
        const catRes = await api.get('/categories/parents');
        setCategories(catRes.data.result || []);

        const shopRes = await api.get('/shops/me');
        const shop = shopRes.data.result;
        if (shop) {
          setShopId(shop.id);
          setShopData({
            shopName: shop.name || '',
            description: shop.description || '',
            phone: '', // Assume shop doesn't have phone, you can map it if you want
            addressText: shop.address || '',
            categoryIds: shop.categories ? shop.categories.map(c => c.id) : [],
            previewUrl: shop.logoUrl || null,
            file: null
          });
        }
      } catch (error) {
        toast.error('Không thể tải thông tin Shop');
      } finally {
        setLoadingCategories(false);
        setLoadingShop(false);
      }
    };
    fetchData();
  }, []);

  const toggleCategory = (categoryId) => {
    setShopData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 2MB');
        return;
      }
      setShopData(prev => ({
        ...prev,
        file,
        previewUrl: URL.createObjectURL(file)
      }));
    }
  };

  const handleUpdateShop = async () => {
    if (!shopData.shopName) {
      toast.error('Tên shop không được để trống');
      return;
    }
    if (!shopData.addressText) {
      toast.error('Địa chỉ không được để trống');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('request', new Blob([JSON.stringify({
        name: shopData.shopName,
        description: shopData.description,
        address: shopData.addressText,
        categoryIds: shopData.categoryIds,
      })], { type: 'application/json' }));

      if (shopData.file) {
        formData.append('file', shopData.file);
      }

      await api.put(`/shops/${shopId}`, formData);
      toast.success('Cập nhật hồ sơ Shop thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingShop) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#ee4d2d]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Hồ sơ Shop</h2>
          <p className="text-sm text-gray-500">Quản lý thông tin hồ sơ để bảo vệ tài khoản và tăng độ tin cậy</p>
        </div>
      </div>

      <div className="p-8 flex flex-col-reverse md:flex-row gap-12">
        {/* Left Side: Form */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-500 text-right">Tên Shop</label>
            <input
              type="text"
              className="input input-bordered focus:border-[#ee4d2d] h-10 w-full"
              value={shopData.shopName}
              onChange={e => setShopData({...shopData, shopName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <label className="text-sm font-medium text-gray-500 text-right mt-3">Mô tả Shop</label>
            <textarea
              className="textarea textarea-bordered focus:border-[#ee4d2d] w-full"
              rows={3}
              value={shopData.description}
              onChange={e => setShopData({...shopData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <label className="text-sm font-medium text-gray-500 text-right mt-3">Ngành hàng</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {loadingCategories ? (
                <div className="text-sm text-gray-500">Đang tải...</div>
              ) : (
                categories.map(cat => {
                  const selected = shopData.categoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selected
                          ? 'bg-[#ee4d2d] border-[#ee4d2d] text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-[#ee4d2d] hover:text-[#ee4d2d]'
                      }`}
                    >
                      {cat.name}{selected ? ' ✓' : ''}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <label className="text-sm font-medium text-gray-500 text-right mt-3">Địa chỉ</label>
            <textarea
              className="textarea textarea-bordered focus:border-[#ee4d2d] w-full"
              rows={2}
              value={shopData.addressText}
              onChange={e => setShopData({...shopData, addressText: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-4 mt-8">
            <div></div>
            <button
              onClick={handleUpdateShop}
              disabled={isSubmitting}
              className="btn border-none bg-[#ee4d2d] hover:bg-[#d73211] text-white px-8 h-10 min-h-10 w-fit"
            >
              {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : 'Lưu Thay Đổi'}
            </button>
          </div>
        </div>

        {/* Right Side: Avatar */}
        <div className="w-full md:w-[300px] flex flex-col items-center justify-start border-l border-gray-100 pl-0 md:pl-8">
          <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 overflow-hidden group hover:border-[#ee4d2d] transition-colors cursor-pointer mb-4">
            {shopData.previewUrl ? (
              <img src={shopData.previewUrl} alt="Logo preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400">
                <Store size={32} className="mx-auto mb-1 opacity-50" />
                <span className="text-xs">Tải ảnh lên</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-medium">Chọn ảnh</span>
            </div>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>Dụng lượng file tối đa 2 MB</p>
            <p>Định dạng: .JPEG, .PNG</p>
          </div>
        </div>
      </div>
    </div>
  );
}