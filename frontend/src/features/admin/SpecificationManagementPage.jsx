import React, { useState, useEffect } from 'react';
import {
  Layers, Plus, Edit2, Trash2, Tag, Check, X, FolderTree, AlertCircle, RefreshCw, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';

export default function SpecificationManagementPage() {
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modal Loại đặc tả (Thêm/Sửa)
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [isEditingType, setIsEditingType] = useState(false);
  const [typeForm, setTypeForm] = useState({
    name: '',
    description: '',
    isVariant: false,
    categoryIds: [],
  });
  const [savingType, setSavingType] = useState(false);

  // Form Thêm/Sửa Giá trị đặc tả
  const [specInput, setSpecInput] = useState('');
  const [specDesc, setSpecDesc] = useState('');
  const [editingSpec, setEditingSpec] = useState(null);
  const [savingSpec, setSavingSpec] = useState(false);

  // Fetch dữ liệu ban đầu
  const fetchData = async () => {
    try {
      setLoading(true);
      const [typesRes, catsRes] = await Promise.all([
        api.get('/specification-types'),
        api.get('/categories'),
      ]);

      const typeList = typesRes.data.result || [];
      setTypes(typeList);
      setCategories(catsRes.data.result || []);

      if (typeList.length > 0) {
        // Giữ type đang chọn hoặc chọn phần tử đầu tiên
        setSelectedType((prev) => {
          if (!prev) return typeList[0];
          const matched = typeList.find((t) => t.id === prev.id);
          return matched || typeList[0];
        });
      } else {
        setSelectedType(null);
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu đặc tả');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- QUẢN LÝ LOẠI ĐẶC TẢ ---
  const handleOpenCreateType = () => {
    setIsEditingType(false);
    setTypeForm({ name: '', description: '', isVariant: false, categoryIds: [] });
    setShowTypeModal(true);
  };

  const handleOpenEditType = (type, e) => {
    e.stopPropagation();
    setIsEditingType(true);
    setTypeForm({
      id: type.id,
      name: type.name || '',
      description: type.description || '',
      isVariant: !!type.isVariant,
      categoryIds: type.categoryIds || [],
    });
    setShowTypeModal(true);
  };

  const handleSaveType = async (e) => {
    e.preventDefault();
    if (!typeForm.name.trim()) {
      toast.error('Tên loại đặc tả không được để trống');
      return;
    }

    try {
      setSavingType(true);
      if (isEditingType) {
        await api.put(`/specification-types/${typeForm.id}`, {
          name: typeForm.name.trim(),
          description: typeForm.description.trim(),
          isVariant: typeForm.isVariant,
          categoryIds: typeForm.categoryIds,
        });
        toast.success('Đã cập nhật loại đặc tả');
      } else {
        await api.post('/specification-types', {
          name: typeForm.name.trim(),
          description: typeForm.description.trim(),
          isVariant: typeForm.isVariant,
          categoryIds: typeForm.categoryIds,
        });
        toast.success('Đã tạo loại đặc tả mới');
      }
      setShowTypeModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSavingType(false);
    }
  };

  const handleDeleteType = async (typeId, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa loại đặc tả này và toàn bộ giá trị bên trong?')) {
      return;
    }

    try {
      await api.delete(`/specification-types/${typeId}`);
      toast.success('Đã xóa loại đặc tả');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa loại đặc tả');
    }
  };

  const toggleCategorySelection = (catId) => {
    setTypeForm((prev) => {
      const exists = prev.categoryIds.includes(catId);
      return {
        ...prev,
        categoryIds: exists
          ? prev.categoryIds.filter((id) => id !== catId)
          : [...prev.categoryIds, catId],
      };
    });
  };

  // --- QUẢN LÝ GIÁ TRỊ ĐẶC TẢ (SPECIFICATIONS) ---
  const handleSaveSpec = async (e) => {
    e.preventDefault();
    if (!specInput.trim()) {
      toast.error('Vui lòng nhập tên giá trị đặc tả');
      return;
    }
    if (!selectedType) return;

    try {
      setSavingSpec(true);
      if (editingSpec) {
        await api.put(`/specifications/${editingSpec.id}`, {
          name: specInput.trim(),
          description: specDesc.trim(),
          specificationTypeId: selectedType.id,
        });
        toast.success('Đã cập nhật giá trị đặc tả');
        setEditingSpec(null);
      } else {
        await api.post(`/specification-types/${selectedType.id}/specifications`, {
          name: specInput.trim(),
          description: specDesc.trim(),
        });
        toast.success(`Đã thêm giá trị "${specInput.trim()}"`);
      }
      setSpecInput('');
      setSpecDesc('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu giá trị');
    } finally {
      setSavingSpec(false);
    }
  };

  const handleEditSpec = (spec) => {
    setEditingSpec(spec);
    setSpecInput(spec.name);
    setSpecDesc(spec.description || '');
  };

  const handleCancelEditSpec = () => {
    setEditingSpec(null);
    setSpecInput('');
    setSpecDesc('');
  };

  const handleDeleteSpec = async (specId) => {
    if (!window.confirm('Bạn có chắc muốn xóa giá trị đặc tả này?')) return;
    try {
      await api.delete(`/specifications/${specId}`);
      toast.success('Đã xóa giá trị đặc tả');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa giá trị đặc tả');
    }
  };

  const filteredTypes = types.filter(
    (t) =>
      t.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="text-[#3b82f6]" size={24} /> Quản lý Đặc tả & Biến thể hệ thống
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Thiết lập danh mục loại biến thể (Màu sắc, Size, RAM...) và gán chuẩn theo từng ngành hàng để người bán chọn sẵn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="btn btn-sm btn-ghost gap-1.5 text-gray-600 hover:text-[#3b82f6]"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
          <button
            onClick={handleOpenCreateType}
            className="btn btn-sm bg-[#3b82f6] hover:bg-blue-600 text-white border-none gap-2 px-4 shadow-sm"
          >
            <Plus size={16} /> Thêm Loại đặc tả
          </button>
        </div>
      </div>

      {/* Main Content - Master / Detail layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= CỘT TRÁI: DANH SÁCH LOẠI ĐẶC TẢ (4 cols) ================= */}
        <div className="lg:col-span-5 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm loại đặc tả..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="input input-sm input-bordered w-full pl-9 bg-white"
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 shrink-0">
              {filteredTypes.length} loại
            </span>
          </div>

          <div className="divide-y divide-gray-100 max-h-[640px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Đang tải danh sách...</div>
            ) : filteredTypes.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                Không tìm thấy loại đặc tả nào.
              </div>
            ) : (
              filteredTypes.map((type) => {
                const isSelected = selectedType?.id === type.id;
                const specCount = type.specifications?.length || 0;
                const catCount = type.categoryNames?.length || 0;

                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`p-4 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                          {type.name}
                        </span>
                        {type.isVariant ? (
                          <span className="badge badge-xs bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold text-[10px]">
                            Biến thể bán
                          </span>
                        ) : (
                          <span className="badge badge-xs bg-gray-100 text-gray-600 border-gray-300 font-medium text-[10px]">
                            Thuộc tính
                          </span>
                        )}
                        <span className="badge badge-sm badge-ghost text-xs font-semibold">
                          {specCount} giá trị
                        </span>
                      </div>

                      {type.description && (
                        <p className="text-xs text-gray-500 truncate mt-1">{type.description}</p>
                      )}

                      {/* Danh mục áp dụng */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {catCount === 0 ? (
                          <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                            Áp dụng tất cả danh mục
                          </span>
                        ) : (
                          type.categoryNames.slice(0, 3).map((cname, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[120px]"
                            >
                              {cname}
                            </span>
                          ))
                        )}
                        {catCount > 3 && (
                          <span className="text-[11px] text-gray-400 self-center">
                            +{catCount - 3} danh mục
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleOpenEditType(type, e)}
                        className="btn btn-xs btn-ghost text-gray-500 hover:text-blue-600"
                        title="Sửa loại đặc tả"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteType(type.id, e)}
                        className="btn btn-xs btn-ghost text-gray-500 hover:text-red-600"
                        title="Xóa loại đặc tả"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= CỘT PHẢI: QUẢN LÝ CÁC GIÁ TRỊ ĐẶC TẢ (7 cols) ================= */}
        <div className="lg:col-span-7 bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {selectedType ? (
            <>
              {/* Header chi tiết */}
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Chi tiết biến thể
                    </span>
                    <h3 className="text-lg font-bold text-gray-800">{selectedType.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedType.description || 'Chưa có mô tả cho loại đặc tả này.'}
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  Gắn cho:{' '}
                  <strong>
                    {selectedType.categoryNames?.length > 0
                      ? `${selectedType.categoryNames.length} danh mục`
                      : 'Tất cả danh mục'}
                  </strong>
                </div>
              </div>

              {/* Form thêm mới / sửa giá trị */}
              <form onSubmit={handleSaveSpec} className="bg-gray-50/80 p-4 rounded-lg border border-gray-200 space-y-3">
                <div className="text-xs font-bold text-gray-700">
                  {editingSpec ? `Đang sửa giá trị: "${editingSpec.name}"` : `+ Thêm giá trị cho "${selectedType.name}"`}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
                  <input
                    type="text"
                    value={specInput}
                    onChange={(e) => setSpecInput(e.target.value)}
                    placeholder="Tên giá trị (Ví dụ: Đỏ, XL, 128GB...)"
                    className="input input-sm input-bordered bg-white focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={specDesc}
                    onChange={(e) => setSpecDesc(e.target.value)}
                    placeholder="Mô tả bổ sung (tùy chọn)"
                    className="input input-sm input-bordered bg-white focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingSpec}
                      className="btn btn-sm bg-[#3b82f6] hover:bg-blue-600 text-white border-none px-4"
                    >
                      {editingSpec ? 'Cập nhật' : 'Thêm'}
                    </button>
                    {editingSpec && (
                      <button
                        type="button"
                        onClick={handleCancelEditSpec}
                        className="btn btn-sm btn-ghost"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Danh sách các giá trị chip tags / table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-700">
                    Danh sách các giá trị hiện có ({selectedType.specifications?.length || 0})
                  </h4>
                  <span className="text-xs text-gray-400">
                    Người bán sẽ chọn từ danh sách này khi đăng sản phẩm
                  </span>
                </div>

                {selectedType.specifications?.length === 0 ? (
                  <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 text-sm">
                    <Tag size={28} className="mx-auto mb-2 opacity-40 text-gray-400" />
                    Chưa có giá trị nào. Hãy nhập giá trị ở khung trên để bổ sung.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {selectedType.specifications.map((spec) => (
                      <div
                        key={spec.id}
                        className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-xs transition-all group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-sm font-bold text-gray-800 truncate">
                            {spec.name}
                          </div>
                          {spec.description && (
                            <div className="text-[11px] text-gray-400 truncate">
                              {spec.description}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditSpec(spec)}
                            className="p-1 hover:text-blue-600 text-gray-400"
                            title="Sửa"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteSpec(spec.id)}
                            className="p-1 hover:text-red-600 text-gray-400"
                            title="Xóa"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-gray-400 text-sm">
              <Layers size={36} className="mx-auto mb-2 opacity-40" />
              Chọn một loại đặc tả ở cột bên trái để quản lý các giá trị.
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL THÊM / SỬA LOẠI ĐẶC TẢ ================= */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-800 text-base">
                {isEditingType ? 'Sửa loại đặc tả' : 'Thêm mới loại đặc tả'}
              </h3>
              <button
                onClick={() => setShowTypeModal(false)}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveType} className="p-6 space-y-4">
              <div className="form-control">
                <label className="label font-semibold text-sm">
                  Tên loại đặc tả <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  placeholder="Ví dụ: Kích cỡ áo, Kích cỡ giày, Dung lượng RAM, Màu sắc..."
                  className="input input-bordered w-full focus:border-blue-500"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label font-medium text-sm">Mô tả loại đặc tả</label>
                <textarea
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  placeholder="Mô tả mục đích hoặc hướng dẫn sử dụng..."
                  className="textarea textarea-bordered w-full focus:border-blue-500 h-20"
                ></textarea>
              </div>

              {/* Toggle Phân loại Biến thể vs Thuộc tính tĩnh */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-sm text-gray-800">Dùng làm Phân loại Biến thể bán hàng</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Bật nếu là phân loại người mua click chọn khi đặt hàng (Màu sắc, Kích cỡ, Dung lượng...). Tắt nếu là thông số chi tiết (Chất liệu, Xuất xứ, Kiểu dáng...).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={typeForm.isVariant}
                    onChange={(e) => setTypeForm({ ...typeForm, isVariant: e.target.checked })}
                    className="toggle toggle-success ml-3 shrink-0"
                  />
                </label>
              </div>

              {/* Chọn danh mục áp dụng */}
              <div className="form-control">
                <div className="flex items-center justify-between mb-1">
                  <label className="label font-semibold text-sm p-0">
                    Áp dụng cho các ngành hàng
                  </label>
                  <span className="text-xs text-gray-400">
                    {typeForm.categoryIds.length === 0
                      ? 'Áp dụng cho tất cả'
                      : `Đã chọn ${typeForm.categoryIds.length} ngành hàng`}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Để trống nếu muốn loại biến thể này xuất hiện ở mọi ngành hàng (như Màu sắc).
                </p>

                <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50/50">
                  {categories.map((cat) => {
                    const isChecked = typeForm.categoryIds.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2.5 text-sm cursor-pointer hover:bg-white p-1 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategorySelection(cat.id)}
                          className="checkbox checkbox-sm checkbox-primary"
                        />
                        <span className="font-medium text-gray-700">{cat.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="btn btn-ghost"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingType}
                  className="btn bg-[#3b82f6] hover:bg-blue-600 text-white border-none px-6"
                >
                  {savingType ? <span className="loading loading-spinner loading-xs"></span> : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
