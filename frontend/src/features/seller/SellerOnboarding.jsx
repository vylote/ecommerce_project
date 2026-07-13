import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Store, MapPin, CheckCircle2, Truck } from 'lucide-react';
import api from '../../shared/utils/api';
import { loginSuccess } from '../../store/slice/authSlice'; // ASSUMPTION: tên action giống bên LoginPage, sửa lại nếu khác

const STEPS = [
  { id: 1, label: 'Thông tin Shop' },
  { id: 2, label: 'Vận chuyển' },
  { id: 3, label: 'Hoàn tất' }
];

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE CHUNG CHO TOÀN BỘ FORM ---
  const [shopData, setShopData] = useState({
    shopName: '',
    phone: '',
    email: '',
    categoryIds: [], // N-N: shop có thể thuộc nhiều ngành hàng
    address: null, // AddressResponse object khi user chọn/thêm địa chỉ
  });

  const [shippingData, setShippingData] = useState({
    instant: true,
    today: false,
    fast: true,
    viettel: true,
    spx: true,
    points: true
  });

  // --- DANH MỤC (từ API) ---
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await api.get('/categories/parents');
        setCategories(res.data.result || []);
      } catch (error) {
        toast.error('Không thể tải danh mục ngành hàng');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (categoryId) => {
    setShopData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  // --- STATE CHO MODAL ĐỊA CHỈ ---
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressMode, setAddressMode] = useState('pick'); // 'pick' | 'create'
  const [tempAddress, setTempAddress] = useState({
    fullName: '', phone: '', province: '', district: '', ward: '', detail: ''
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const openAddressModal = async () => {
    setShowAddressModal(true);
    try {
      setLoadingAddresses(true);
      const res = await api.get('/addresses');
      const list = res.data.result || [];
      setSavedAddresses(list);
      setAddressMode(list.length > 0 ? 'pick' : 'create');
    } catch (error) {
      toast.error('Không thể tải danh sách địa chỉ đã lưu');
      setAddressMode('create');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handlePickAddress = (addr) => {
    setShopData({ ...shopData, address: addr });
    setShowAddressModal(false);
  };

  const handleSaveNewAddress = async () => {
    const { fullName, phone, province, district, ward, detail } = tempAddress;
    if (!fullName || !phone || !province || !district || !ward || !detail) {
      toast.error('Vui lòng điền đủ thông tin địa chỉ');
      return;
    }
    try {
      setSavingAddress(true);
      const res = await api.post('/addresses', tempAddress);
      const created = res.data.result;
      setShopData({ ...shopData, address: created });
      setShowAddressModal(false);
      toast.success('Đã lưu địa chỉ');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể lưu địa chỉ');
    } finally {
      setSavingAddress(false);
    }
  };

  // --- CÁC HÀM XỬ LÝ CHUYỂN BƯỚC ---
  const nextStep = () => {
    if (currentStep === 1) {
      if (!shopData.shopName || !shopData.phone || !shopData.email) {
        toast.error('Vui lòng điền đủ thông tin cơ bản!');
        return;
      }
      if (!shopData.address) {
        toast.error('Vui lòng thêm địa chỉ lấy hàng!');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleRegisterShop = async () => {
    setIsSubmitting(true);
    try {
      const addr = shopData.address;
      // Ghép đầy đủ detail/ward/district/province thay vì chỉ detail+province
      const fullAddress = [addr.detail, addr.ward, addr.district, addr.province]
        .filter(Boolean)
        .join(', ');

      // 1. Tạo shop - Shop-Category là N-N nên gửi mảng categoryIds
      // Đã xác nhận khớp ShopRequest.categoryIds (Set<Long>) thật ở backend.
      await api.post('/shops', {
        name: shopData.shopName,
        description: "Cửa hàng của " + shopData.shopName,
        address: fullAddress,
        logoUrl: null,
        categoryIds: shopData.categoryIds,
      });

      // 2. Refresh token để nhận quyền Seller mới
      const userRes = await api.post('/auth/refresh');

      // 3. Cập nhật lại Redux store với thông tin User có ROLE_SELLER
      dispatch(loginSuccess({ user: userRes.data.result }));

      toast.success('Đăng ký Shop thành công!');
      navigate('/seller/dashboard');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1000px] mx-auto px-6 py-4 flex items-center gap-3">
          <Store className="text-[#ee4d2d]" size={28} />
          <h1 className="text-xl font-bold text-gray-800 tracking-wide">Đăng ký trở thành Người bán</h1>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-8">
        {/* THANH TIẾN ĐỘ (STEPPER) */}
        <div className="mb-10">
          <div className="flex justify-between items-center max-w-2xl mx-auto relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#ee4d2d] z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            ></div>

            {STEPS.map((step) => {
              const isActive = currentStep >= step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 shadow-sm ${
                    isActive ? 'bg-[#ee4d2d] text-white' : 'bg-gray-200 text-gray-500'
                  } ${isCurrent ? 'ring-4 ring-orange-100' : ''}`}>
                    {isActive && !isCurrent ? <CheckCircle2 size={20} /> : step.id}
                  </div>
                  <span className={`mt-2 text-sm font-medium absolute -bottom-6 w-32 text-center ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* NỘI DUNG TỪNG BƯỚC */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mt-12 min-h-[400px]">

          {/* ====== BƯỚC 1: THÔNG TIN SHOP ====== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold border-b pb-4">Thông tin cơ bản</h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label font-medium text-gray-700">Tên shop *</label>
                  <input
                    type="text" className="input input-bordered focus:border-[#ee4d2d]" placeholder="Nhập tên shop"
                    value={shopData.shopName} onChange={e => setShopData({...shopData, shopName: e.target.value})}
                  />
                </div>
                <div className="form-control">
                  <label className="label font-medium text-gray-700">Số điện thoại *</label>
                  <input
                    type="text" className="input input-bordered focus:border-[#ee4d2d]" placeholder="09xxxxxxx"
                    value={shopData.phone} onChange={e => setShopData({...shopData, phone: e.target.value})}
                  />
                </div>
                <div className="form-control col-span-2">
                  <label className="label font-medium text-gray-700">Email *</label>
                  <input
                    type="email" className="input input-bordered focus:border-[#ee4d2d] w-full" placeholder="email@domain.com"
                    value={shopData.email} onChange={e => setShopData({...shopData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Ngành hàng - N-N nên chọn nhiều bằng chip, không dùng select đơn nữa */}
              <div className="form-control">
                <label className="label font-medium text-gray-700">Ngành hàng kinh doanh</label>
                {loadingCategories ? (
                  <div className="text-sm text-gray-500">Đang tải...</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
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
                    })}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">Có thể chọn nhiều ngành hàng</div>
              </div>

              <div className="mt-8 border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Địa chỉ lấy hàng *</h3>
                  {!shopData.address && (
                    <button onClick={openAddressModal} className="btn btn-sm btn-outline text-[#ee4d2d] hover:bg-[#ee4d2d] hover:text-white hover:border-[#ee4d2d]">
                      + Thêm địa chỉ
                    </button>
                  )}
                </div>

                {shopData.address ? (
                  <div className="p-4 border rounded-md bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{shopData.address.fullName} | {shopData.address.phone}</div>
                      <div className="text-gray-600 text-sm mt-1">
                        {[shopData.address.detail, shopData.address.ward, shopData.address.district, shopData.address.province]
                          .filter(Boolean).join(', ')}
                      </div>
                    </div>
                    <button onClick={openAddressModal} className="text-blue-600 text-sm hover:underline">Sửa</button>
                  </div>
                ) : (
                  <div className="p-6 border border-dashed rounded-md bg-gray-50 text-center text-gray-500">
                    <MapPin className="mx-auto mb-2 opacity-50" size={32}/>
                    Bạn chưa thiết lập địa chỉ lấy hàng/trả hàng.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ====== BƯỚC 2: CÀI ĐẶT VẬN CHUYỂN ====== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold">Cài đặt vận chuyển</h2>
                <p className="text-gray-500 text-sm mt-1">Kích hoạt các phương thức giao hàng bạn muốn hỗ trợ.</p>
              </div>

              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b font-medium text-gray-800 flex items-center gap-2">
                  <Truck size={18} className="text-[#ee4d2d]"/> Đơn Hỏa Tốc
                </div>
                <div className="p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-800">Hỏa Tốc <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-2">Hỗ trợ COD</span></div>
                    <div className="text-sm text-gray-500 mt-1">Giao hàng tức thì trong vòng 2H (Nội thành)</div>
                  </div>
                  <input type="checkbox" className="toggle toggle-success" checked={shippingData.instant} onChange={() => setShippingData({...shippingData, instant: !shippingData.instant})} />
                </div>
              </div>

              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b font-medium text-gray-800 flex items-center gap-2">
                  <Truck size={18} className="text-[#ee4d2d]"/> Đơn Thường
                </div>
                <div className="divide-y">
                  <div className="p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-semibold text-gray-800">Nhanh <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-2">Hỗ trợ COD</span></div>
                      <div className="text-sm text-gray-500 mt-1">Giao hàng tiêu chuẩn toàn quốc (GHTK, GHN, SPX...)</div>
                    </div>
                    <input type="checkbox" className="toggle toggle-success" checked={shippingData.fast} onChange={() => setShippingData({...shippingData, fast: !shippingData.fast})} />
                  </div>
                  <div className="p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-semibold text-gray-800">Tiết Kiệm</div>
                      <div className="text-sm text-gray-500 mt-1">Chi phí rẻ hơn, thời gian giao hàng từ 3-5 ngày</div>
                    </div>
                    <input type="checkbox" className="toggle toggle-success" checked={shippingData.today} onChange={() => setShippingData({...shippingData, today: !shippingData.today})} />
                  </div>
                </div>
              </div>

              {/* Trang này chưa có backend API riêng cho shipping config -> cho mình biết
                  ShopShippingConfig / entity liên quan để nối API thật ở bước xác nhận */}
            </div>
          )}

          {/* ====== BƯỚC 3: HOÀN TẤT & XÁC NHẬN ====== */}
          {currentStep === 3 && (
            <div className="text-center animate-fade-in py-8">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Sẵn sàng bán hàng!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Hồ sơ Shop của bạn đã hoàn chỉnh. Vui lòng kiểm tra lại thông tin và xác nhận để chính thức kích hoạt gian hàng.
              </p>

              <div className="bg-gray-50 p-6 rounded-lg text-left max-w-md mx-auto border mb-8">
                <div className="grid grid-cols-3 gap-y-3 text-sm">
                  <div className="text-gray-500">Tên Shop:</div><div className="col-span-2 font-medium">{shopData.shopName}</div>
                  <div className="text-gray-500">Ngành hàng:</div>
                  <div className="col-span-2 font-medium">
                    {shopData.categoryIds.length > 0
                      ? categories
                          .filter(c => shopData.categoryIds.includes(c.id))
                          .map(c => c.name)
                          .join(', ')
                      : '—'}
                  </div>
                  <div className="text-gray-500">Liên hệ:</div><div className="col-span-2 font-medium">{shopData.phone}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- THANH ĐIỀU HƯỚNG --- */}
        <div className="flex justify-between items-center mt-6">
          {currentStep > 1 ? (
            <button onClick={prevStep} className="btn btn-outline border-gray-300 hover:bg-gray-100 hover:text-gray-800 px-8">
              Quay lại
            </button>
          ) : <div></div>}

          {currentStep < 3 ? (
            <button onClick={nextStep} className="btn border-none bg-[#ee4d2d] hover:bg-[#d73211] text-white px-10">
              Tiếp theo
            </button>
          ) : (
            <button onClick={handleRegisterShop} disabled={isSubmitting} className="btn border-none bg-[#ee4d2d] hover:bg-[#d73211] text-white px-10">
              {isSubmitting ? <span className="loading loading-spinner"></span> : 'Xác nhận & Đăng ký'}
            </button>
          )}
        </div>
      </div>

      {/* ====== MODAL ĐỊA CHỈ (chọn có sẵn hoặc thêm mới) ====== */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden animate-fade-in-up max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Địa chỉ lấy hàng</h3>
              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => setAddressMode('pick')}
                  className={`px-3 py-1 rounded ${addressMode === 'pick' ? 'bg-[#ee4d2d] text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Đã lưu
                </button>
                <button
                  onClick={() => setAddressMode('create')}
                  className={`px-3 py-1 rounded ${addressMode === 'create' ? 'bg-[#ee4d2d] text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Thêm mới
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              {addressMode === 'pick' ? (
                loadingAddresses ? (
                  <div className="text-sm text-gray-500 text-center py-8">Đang tải...</div>
                ) : savedAddresses.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-8">
                    Chưa có địa chỉ nào đã lưu.{' '}
                    <button onClick={() => setAddressMode('create')} className="text-blue-600 hover:underline">
                      Thêm mới
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedAddresses.map(addr => (
                      <button
                        key={addr.id}
                        onClick={() => handlePickAddress(addr)}
                        className="w-full text-left p-3 border rounded-md hover:border-[#ee4d2d] hover:bg-orange-50 transition-colors"
                      >
                        <div className="font-medium text-sm">
                          {addr.fullName} <span className="text-gray-500 font-normal">| {addr.phone}</span>
                          {addr.isDefault && (
                            <span className="ml-2 text-xs border border-[#ee4d2d] text-[#ee4d2d] px-1.5 py-0.5 rounded">Mặc định</span>
                          )}
                        </div>
                        <div className="text-gray-600 text-sm mt-1">
                          {[addr.detail, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label text-sm font-medium">Họ & Tên</label>
                      <input type="text" className="input input-bordered" value={tempAddress.fullName} onChange={e => setTempAddress({...tempAddress, fullName: e.target.value})} />
                    </div>
                    <div className="form-control">
                      <label className="label text-sm font-medium">Số điện thoại</label>
                      <input type="text" className="input input-bordered" value={tempAddress.phone} onChange={e => setTempAddress({...tempAddress, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="form-control">
                      <label className="label text-sm font-medium">Tỉnh/Thành phố</label>
                      <select className="select select-bordered" value={tempAddress.province} onChange={e => setTempAddress({...tempAddress, province: e.target.value})}>
                        <option value="">Chọn</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label text-sm font-medium">Quận/Huyện</label>
                      <input type="text" className="input input-bordered" value={tempAddress.district} onChange={e => setTempAddress({...tempAddress, district: e.target.value})} />
                    </div>
                    <div className="form-control">
                      <label className="label text-sm font-medium">Phường/Xã</label>
                      <input type="text" className="input input-bordered" value={tempAddress.ward} onChange={e => setTempAddress({...tempAddress, ward: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label text-sm font-medium">Địa chỉ cụ thể</label>
                    <textarea className="textarea textarea-bordered h-20" placeholder="Số nhà, tên đường..." value={tempAddress.detail} onChange={e => setTempAddress({...tempAddress, detail: e.target.value})}></textarea>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t shrink-0">
              <button onClick={() => setShowAddressModal(false)} className="btn btn-ghost">Hủy</button>
              {addressMode === 'create' && (
                <button
                  onClick={handleSaveNewAddress}
                  disabled={savingAddress}
                  className="btn border-none bg-[#ee4d2d] hover:bg-[#d73211] text-white disabled:opacity-50"
                >
                  {savingAddress ? 'Đang lưu...' : 'Lưu địa chỉ'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}