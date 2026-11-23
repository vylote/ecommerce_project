import React, { useState, useEffect, useRef } from 'react';
import {
  FolderTree, Plus, Edit2, Trash2, Search, RefreshCw, Folder,
  Image as ImageIcon, CheckCircle, XCircle, ArrowRight, ExternalLink,
  ChevronRight, Layers, X, UploadCloud, Link as LinkIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';
import Pagination from '../../shared/components/Pagination';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Helper lấy URL ảnh hoàn chỉnh cho danh mục (hỗ trợ cả ảnh Cloudinary và ảnh nội bộ backend như automotive.png)
const getCategoryImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanName = url.startsWith('/') ? url.substring(1) : url;
  return `${BASE_URL}/images/categories/${cleanName}`;
};

// Hàm helper tạo slug từ tên tiếng Việt
const generateSlug = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterParentId, setFilterParentId] = useState('ALL');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modal Thêm/Sửa
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [categoryForm, setCategoryForm] = useState({
    id: null,
    name: '',
    slug: '',
    parentId: '',
    imageUrl: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  // Tải danh mục
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      const list = Array.isArray(res.data?.result) ? res.data.result : (res.data?.result?.data || []);
      setCategories(list);
    } catch (error) {
      toast.error('Không thể tải danh sách ngành hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCategoryForm({
      id: null,
      name: '',
      slug: '',
      parentId: '',
      imageUrl: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenCreateChild = (parentCat) => {
    setIsEditing(false);
    setCategoryForm({
      id: null,
      name: '',
      slug: '',
      parentId: String(parentCat.id),
      imageUrl: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh (PNG, JPG, WebP...)');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/categories/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data?.result;
      if (url) {
        setCategoryForm((prev) => ({ ...prev, imageUrl: url }));
        toast.success('Tải ảnh biểu tượng lên thành công!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleOpenEdit = (cat) => {
    setIsEditing(true);
    setCategoryForm({
      id: cat.id,
      name: cat.name || '',
      slug: cat.slug || '',
      parentId: cat.parentId ? String(cat.parentId) : '',
      imageUrl: cat.imageUrl || '',
      isActive: cat.isActive !== false,
    });
    setShowModal(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setCategoryForm((prev) => ({
      ...prev,
      name: val,
      // Tự động tạo slug nếu đang thêm mới hoặc slug chưa bị sửa tay
      slug: !isEditing ? generateSlug(val) : prev.slug,
    }));
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Tên danh mục không được để trống');
      return;
    }
    if (!categoryForm.slug.trim()) {
      toast.error('Slug không được để trống');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim(),
        parentId: categoryForm.parentId ? Number(categoryForm.parentId) : null,
        imageUrl: categoryForm.imageUrl.trim() || undefined,
        isActive: categoryForm.isActive,
      };

      if (isEditing) {
        await api.put(`/categories/${categoryForm.id}`, payload);
        toast.success('Đã cập nhật danh mục thành công');
      } else {
        await api.post('/categories', payload);
        toast.success('Đã tạo danh mục mới thành công');
      }

      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const hasChildren = categories.some((c) => c.parentId === cat.id);
    if (hasChildren) {
      toast.error('Không thể xóa danh mục này vì đang chứa các danh mục con. Vui lòng chuyển hoặc xóa danh mục con trước.');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/categories/${cat.id}`);
      toast.success('Đã xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa danh mục này');
    }
  };

  // Danh mục gốc (Parents)
  const catArray = Array.isArray(categories) ? categories : [];
  const parentCategories = catArray.filter((c) => !c.parentId);

  // Lọc danh mục hiển thị
  const filteredCategories = catArray.filter((c) => {
    const matchSearch =
      c.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchParent =
      filterParentId === 'ALL'
        ? true
        : filterParentId === 'ROOT'
        ? !c.parentId
        : c.parentId === Number(filterParentId);

    return matchSearch && matchParent;
  });

  // Tự động về trang 1 khi lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, filterParentId]);

  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* HEADER TRANG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <FolderTree size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Quản lý Danh mục Ngành hàng</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Cấu trúc phân cấp ngành hàng trên sàn, liên kết đặc tả và quản lý hiển thị
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            className="btn btn-sm btn-outline border-gray-300 gap-1.5"
            title="Tải lại danh sách"
          >
            <RefreshCw size={15} /> Làm mới
          </button>
          <button
            onClick={handleOpenCreate}
            className="btn btn-sm bg-[#3b82f6] hover:bg-blue-600 text-white border-none gap-2 px-4 shadow-xs"
          >
            <Plus size={16} /> Thêm Danh mục
          </button>
        </div>
      </div>

      {/* THẺ THỐNG KÊ NHANH */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Tổng danh mục</span>
            <div className="text-2xl font-bold text-gray-800 mt-0.5">{categories.length}</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FolderTree size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Danh mục gốc (Cấp 1)</span>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">{parentCategories.length}</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Folder size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Danh mục con (Cấp 2+)</span>
            <div className="text-2xl font-bold text-purple-600 mt-0.5">
              {categories.length - parentCategories.length}
            </div>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>

      {/* BỘ LỌC VÀ TÌM KIẾM */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên danh mục hoặc slug..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="input input-sm input-bordered w-full pl-9 bg-white text-xs"
            />
          </div>

          <select
            value={filterParentId}
            onChange={(e) => setFilterParentId(e.target.value)}
            className="select select-sm select-bordered text-xs bg-white"
          >
            <option value="ALL">-- Tất cả cấp độ --</option>
            <option value="ROOT">Chỉ danh mục gốc (Cấp 1)</option>
            {parentCategories.map((p) => (
              <option key={p.id} value={p.id}>
                Nhánh con của: {p.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-gray-500 font-medium shrink-0">
          Hiển thị {filteredCategories.length} / {categories.length} danh mục
        </span>
      </div>

      {/* BẢNG DANH MỤC */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="w-12">ID</th>
                <th>Tên Danh mục</th>
                <th>Slug URL</th>
                <th>Cấp bậc (Phân cấp)</th>
                <th>Trạng thái</th>
                <th className="text-center">Đặc tả chuẩn</th>
                <th className="w-24 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Đang tải danh sách danh mục...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Không tìm thấy danh mục nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((cat) => {
                  const isParent = !cat.parentId;
                  const parentObj = categories.find((c) => c.id === cat.parentId);

                  return (
                    <tr key={cat.id} className="hover:bg-gray-50/70">
                      <td className="font-mono text-gray-400 font-bold">{cat.id}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                            {cat.imageUrl ? (
                              <img
                                src={getCategoryImageUrl(cat.imageUrl)}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Folder size={16} className={isParent ? 'text-blue-500' : 'text-gray-400'} />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                              <span>{cat.name}</span>
                              {isParent && (
                                <span className="badge badge-xs bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                                  Gốc
                                </span>
                              )}
                            </div>
                            {cat.imageUrl && (
                              <span className="text-[10px] text-gray-400 truncate max-w-xs block">
                                {cat.imageUrl}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-[11px] bg-gray-50 px-2 py-0.5 rounded border border-gray-200 text-gray-600">
                          /{cat.slug}
                        </span>
                      </td>
                      <td>
                        {isParent ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <span>●</span> Danh mục cấp 1
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-600">
                            <span className="text-gray-400">↳ Con của:</span>
                            <span className="font-semibold text-gray-800">
                              {parentObj?.name || `ID #${cat.parentId}`}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        {cat.isActive !== false ? (
                          <span className="badge badge-xs bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold text-[10px]">
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="badge badge-xs bg-gray-100 text-gray-500 border-gray-300 font-medium text-[10px]">
                            Tạm ẩn
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <Link
                          to="/admin/specifications"
                          className="btn btn-xs btn-ghost text-blue-600 hover:bg-blue-50 gap-1"
                          title="Xem đặc tả liên kết với danh mục này"
                        >
                          <Layers size={13} /> Đặc tả
                        </Link>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isParent && (
                            <button
                              onClick={() => handleOpenCreateChild(cat)}
                              className="p-1.5 hover:text-emerald-600 text-gray-400 rounded hover:bg-emerald-50 transition-colors"
                              title="Thêm danh mục con vào ngành này"
                            >
                              <Plus size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 hover:text-blue-600 text-gray-400 rounded hover:bg-gray-100"
                            title="Sửa danh mục"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 hover:text-red-600 text-gray-400 rounded hover:bg-gray-100"
                            title="Xóa danh mục"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* THANH PHÂN TRANG */}
        <div className="border-t border-gray-100 px-4 py-1 bg-gray-50/50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 15, 25, 50, 100]}
          />
        </div>
      </div>

      {/* ================= MODAL THÊM / SỬA DANH MỤC ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <FolderTree size={20} className="text-blue-600" />
                <h3 className="font-bold text-gray-800 text-base">
                  {isEditing ? 'Cập nhật danh mục' : 'Thêm mới danh mục'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-sm btn-ghost btn-circle text-gray-500 hover:text-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div className="form-control">
                <label className="label font-semibold text-xs text-gray-700">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={handleNameChange}
                  placeholder="Ví dụ: Thời trang nam, Thiết bị di động, Đồ gia dụng..."
                  className="input input-sm input-bordered w-full focus:border-blue-500 text-xs"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label font-semibold text-xs text-gray-700">
                  Slug URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="thoi-trang-nam"
                  className="input input-sm input-bordered w-full focus:border-blue-500 font-mono text-xs"
                  required
                />
                <span className="text-[11px] text-gray-400 mt-1">Đường dẫn thân thiện SEO (không dấu, cách nhau bởi dấu gạch ngang)</span>
              </div>

              <div className="form-control">
                <label className="label font-semibold text-xs text-gray-700">
                  Danh mục cha (Cấp độ)
                </label>
                <select
                  value={categoryForm.parentId}
                  onChange={(e) => setCategoryForm({ ...categoryForm, parentId: e.target.value })}
                  className="select select-sm select-bordered w-full focus:border-blue-500 text-xs"
                >
                  <option value="">-- Là danh mục gốc (Cấp 1) --</option>
                  {parentCategories
                    .filter((p) => p.id !== categoryForm.id) // Không thể làm con của chính mình
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* UPLOAD / NHẬP HÌNH ẢNH DANH MỤC */}
              <div className="form-control">
                <label className="label font-semibold text-xs text-gray-700">
                  Hình ảnh / Icon biểu tượng danh mục
                </label>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {categoryForm.imageUrl ? (
                      <div className="relative w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 shadow-xs">
                        <img
                          src={getCategoryImageUrl(categoryForm.imageUrl)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setCategoryForm((prev) => ({ ...prev, imageUrl: '' }))}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white p-0.5 rounded-full transition-colors"
                          title="Xóa ảnh"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 shrink-0 bg-gray-50/50">
                        <ImageIcon size={20} />
                        <span className="text-[9px] mt-0.5">Chưa có</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="btn btn-sm btn-outline border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 w-full gap-2 text-xs"
                      >
                        {uploadingImage ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Đang tải ảnh lên...
                          </>
                        ) : (
                          <>
                            <UploadCloud size={15} /> Tải ảnh từ máy tính
                          </>
                        )}
                      </button>

                      <div className="relative">
                        <LinkIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="url"
                          value={categoryForm.imageUrl}
                          onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                          placeholder="Hoặc dán trực tiếp đường dẫn URL ảnh..."
                          className="input input-xs input-bordered w-full pl-8 focus:border-blue-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-xs text-gray-800">Trạng thái hoạt động</span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Cho phép người bán chọn và hiển thị sản phẩm thuộc ngành hàng này trên sàn.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={categoryForm.isActive}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                    className="toggle toggle-success toggle-sm ml-3 shrink-0"
                  />
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-sm btn-ghost"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="btn btn-sm bg-[#3b82f6] hover:bg-blue-600 text-white border-none px-6"
                >
                  {saving ? <span className="loading loading-spinner loading-xs"></span> : 'Lưu danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
