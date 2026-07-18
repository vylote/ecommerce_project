import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Plus, Info, X } from "lucide-react"; // Bổ sung icon X
import toast from "react-hot-toast";
import api from "../../shared/utils/api"; // Import API

const TABS = [
  { id: "basic", label: "Thông tin cơ bản" },
  { id: "detail", label: "Thông tin chi tiết" },
  { id: "sales", label: "Thông tin bán hàng" },
  { id: "shipping", label: "Vận chuyển" },
  { id: "other", label: "Thông tin khác" },
];

export default function AddProduct() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false); // Khóa nút khi đang gọi API

  // ================= 1. STATE QUẢN LÝ DỮ LIỆU TOÀN BỘ FORM =================
  const [productForm, setProductForm] = useState({
    // Tab: Thông tin cơ bản
    name: "",
    categoryId: "",
    description: "",
    // Tab: Thông tin chi tiết
    brand: "",
    origin: "",
    material: "",
    gender: "Nam",
    manufacturer: "",
    manufacturerAddress: "",
    // Tab: Thông tin bán hàng
    price: "",
    stock: "",
    minOrder: 1,
    maxOrder: "Không",
    // Tab: Vận chuyển
    weight: "",
    length: "",
    width: "",
    height: "",
    freeShipping: false,
  });

  // State chứa danh mục thật từ Backend
  const [categories, setCategories] = useState([]);

  // --- STATE VÀ REF CHO TÍNH NĂNG UPLOAD ẢNH (MỚI LẮP THÊM) ---
  const [imageFiles, setImageFiles] = useState([]); // Mảng chứa object: { file, previewUrl }
  const fileInputRef = useRef(null);

  // Fetch danh mục khi vào trang
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories"); // Tùy chỉnh endpoint lấy danh mục của bạn
        setCategories(res.data.result || []);
      } catch (error) {
        toast.error("Không thể tải danh sách ngành hàng");
      }
    };
    fetchCategories();
  }, []);

  // Hàm update state động, dùng chung cho input/select/textarea
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- HÀM XỬ LÝ CHỌN VÀ XÓA ẢNH (MỚI LẮP THÊM) ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 9) {
      toast.error("Chỉ được tải lên tối đa 9 hình ảnh");
      return;
    }

    // Tạo URL để preview ảnh ngay lập tức
    const newImages = files.map((file) => ({
      file: file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImageFiles((prev) => [...prev, ...newImages]);

    // Reset input để có thể chọn lại cùng 1 file nếu vừa xóa
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Thu hồi các object URL khi component unmount để tránh rò rỉ bộ nhớ
  useEffect(() => {
    return () => {
      imageFiles.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================= 2. LOGIC KIỂM TRA ĐIỀU KIỆN KÍCH HOẠT NÚT LƯU =================
  const isFormValid = () => {
    // Các trường bắt buộc (đánh dấu *) không được bỏ trống
    return (
      productForm.name.trim() !== "" &&
      productForm.categoryId !== "" &&
      productForm.description.trim() !== "" &&
      productForm.price !== "" &&
      productForm.stock !== "" &&
      productForm.weight !== "" &&
      imageFiles.length > 0 // Bắt buộc phải có ít nhất 1 ảnh
    );
  };

  // ================= 3. HÀM XỬ LÝ GỬI API TẠO SẢN PHẨM =================
  const handleSubmit = async (mode) => {
    setIsSubmitting(true);
    try {
      // BƯỚC 1: Lọc đúng các trường chuẩn của ProductRequest hiện tại của Backend
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        stockQuantity: Number(productForm.stock),
        categoryId: Number(productForm.categoryId),

        status: mode === "HIDE" ? "INACTIVE" : "ACTIVE"
      };

      // BƯỚC 2: Gọi API Tạo thông tin text trước để lấy ID sản phẩm
      const res = await api.post("/products", payload);
      const newProductId = res.data.result.id;

      // BƯỚC 3: Bắn liên hoàn các API Upload Ảnh dựa trên ID vừa được tạo (MỚI LẮP THÊM)
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map((imgObj, index) => {
          const formData = new FormData();
          formData.append("file", imgObj.file);
          formData.append("isPrimary", index === 0); // Ảnh đầu tiên sẽ là ảnh bìa
          formData.append("sortOrder", index);

          return api.post(`/products/${newProductId}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        });

        // Chờ tất cả ảnh upload xong
        await Promise.all(uploadPromises);
      }

      toast.success("Đã thêm sản phẩm mới thành công!");
      navigate("/seller/dashboard"); // Hoặc điều hướng về trang Quản lý Sản phẩm
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo sản phẩm",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 animate-fade-in">
      {/* Title trang - Navbar đã được xử lý bởi SellerLayout */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">Thêm 1 sản phẩm mới</h2>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* ================= SIDEBAR GỢI Ý ================= */}
        <aside className="w-full xl:w-[280px] bg-white border border-gray-200 rounded-lg p-5 shadow-sm shrink-0 sticky top-20">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Info size={18} className="text-blue-500" /> Gợi ý điền Thông tin
          </h3>
          <ul className="text-sm text-gray-600 space-y-2.5 mb-6 list-disc pl-4">
            <li>Thêm ít nhất 3 hình ảnh</li>
            <li>Thêm video sản phẩm</li>
            <li>Thêm 25~100 kí tự cho tên sản phẩm</li>
            <li>Thêm ít nhất 100 kí tự hoặc 1 hình ảnh trong mô tả sản phẩm</li>
            <li>Thêm thương hiệu</li>
            <li>Thông tin chi tiết sản phẩm</li>
          </ul>

          <h3 className="font-bold text-gray-800 mb-2">Mẹo Tên sản phẩm</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Tên sản phẩm nên rõ ràng, không chứa ký tự đặc biệt, độ dài 25–100
            ký tự. Sử dụng tiếng Việt có dấu.
          </p>
        </aside>

        {/* ================= KHU VỰC MAIN (FULL-WIDTH) ================= */}
        <main className="flex-1 min-w-0 w-full">
          {/* TABS HEADER */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            {TABS.map((tab) => {
              // Gắn cờ disable cho tab "Thông tin chi tiết"
              const isDisabled = tab.id === "detail";
              
              return (
                <button
                  key={tab.id}
                  disabled={isDisabled}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${
                    isDisabled
                      ? "bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed" // Style cho tab bị vô hiệu hóa
                      : activeTab === tab.id
                      ? "bg-[#ee4d2d] text-white shadow-sm" // Style cho tab đang được chọn
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#ee4d2d]" // Style cho các tab bình thường
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ================= TAB 1: THÔNG TIN CƠ BẢN ================= */}
          {activeTab === "basic" && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-fade-in">
              <h2 className="text-lg font-bold mb-6">Thông tin cơ bản</h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* --- KHU VỰC UPLOAD ẢNH (ĐÃ LẮP LOGIC MỚI) --- */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-start min-h-[160px]">
                  <div className="font-semibold text-gray-700 text-sm mb-3">
                    Hình ảnh sản phẩm ({imageFiles.length}/9) *
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {/* Render danh sách ảnh đã chọn */}
                    {imageFiles.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 border rounded-md overflow-hidden group"
                      >
                        <img
                          src={img.previewUrl}
                          alt={`preview-${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X size={14} />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-[#ee4d2d] text-white text-[10px] text-center py-0.5">
                            Ảnh bìa
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Nút bấm để chọn thêm ảnh */}
                    {imageFiles.length < 9 && (
                      <div
                        onClick={() => fileInputRef.current.click()}
                        className="w-20 h-20 border border-dashed border-[#ee4d2d] text-[#ee4d2d] rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 transition-colors"
                      >
                        <Plus size={24} />
                        <span className="text-[10px] mt-1 font-medium">
                          Thêm ảnh
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thẻ input file ẩn đi */}
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </div>

                {/* Video Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer transition-colors">
                  <UploadCloud size={32} className="text-gray-400 mb-2" />
                  <span className="font-semibold text-gray-700 text-sm">
                    Thêm video sản phẩm
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Tối đa 30Mb, độ dài 10s~60s
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="form-control">
                  <label className="label font-semibold text-sm">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleInputChange}
                    className="input input-bordered focus:border-[#ee4d2d]"
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>

                <div className="form-control">
                  <label className="label font-semibold text-sm">
                    Ngành hàng *
                  </label>
                  <select
                    name="categoryId"
                    value={productForm.categoryId}
                    onChange={handleInputChange}
                    className="select select-bordered focus:border-[#ee4d2d]"
                  >
                    <option value="">Chọn ngành hàng</option>
                    {/* Render động danh mục từ Database */}
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label font-semibold text-sm">
                    Mô tả sản phẩm *
                  </label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered h-32 focus:border-[#ee4d2d]"
                    placeholder="Nhập mô tả sản phẩm chi tiết..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: THÔNG TIN CHI TIẾT ================= */}
          {activeTab === "detail" && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-fade-in">
              <h2 className="text-lg font-bold mb-6">Thông tin chi tiết</h2>
              <div className="grid grid-cols-2 gap-5">
                <div className="form-control">
                  <label className="label font-semibold text-sm">
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={productForm.brand}
                    onChange={handleInputChange}
                    className="input input-bordered focus:border-[#ee4d2d]"
                    placeholder="Nhập thương hiệu"
                  />
                </div>
                <div className="form-control">
                  <label className="label font-semibold text-sm">Xuất xứ</label>
                  <input
                    type="text"
                    name="origin"
                    value={productForm.origin}
                    onChange={handleInputChange}
                    className="input input-bordered focus:border-[#ee4d2d]"
                    placeholder="Nhập xuất xứ"
                  />
                </div>
                <div className="form-control">
                  <label className="label font-semibold text-sm">
                    Chất liệu
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={productForm.material}
                    onChange={handleInputChange}
                    className="input input-bordered focus:border-[#ee4d2d]"
                    placeholder="Nhập chất liệu"
                  />
                </div>
                <div className="form-control">
                  <label className="label font-semibold text-sm">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={productForm.gender}
                    onChange={handleInputChange}
                    className="select select-bordered focus:border-[#ee4d2d]"
                  >
                    <option>Nam</option>
                    <option>Nữ</option>
                    <option>Unisex</option>
                  </select>
                </div>
                <div className="form-control col-span-2">
                  <label className="label font-semibold text-sm">
                    Tên tổ chức chịu trách nhiệm sản xuất
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={productForm.manufacturer}
                    onChange={handleInputChange}
                    className="input input-bordered focus:border-[#ee4d2d]"
                    placeholder="Nhập tên tổ chức"
                  />
                </div>
                <div className="form-control col-span-2">
                  <label className="label font-semibold text-sm">
                    Địa chỉ tổ chức sản xuất
                  </label>
                  <input
                    type="text"
                    name="manufacturerAddress"
                    value={productForm.manufacturerAddress}
                    onChange={handleInputChange}
                    className="input input-bordered focus:border-[#ee4d2d]"
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: THÔNG TIN BÁN HÀNG ================= */}
          {activeTab === "sales" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-2">Phân loại hàng</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Thêm nhóm phân loại để quản lý biến thể (màu, size, kiểu...).
                </p>

                <div className="border border-dashed border-gray-300 bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">
                      Nhóm phân loại:{" "}
                      <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs">
                        Chưa có
                      </span>
                    </span>
                    <button className="btn btn-sm bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
                      <Plus size={16} /> Thêm nhóm
                    </button>
                  </div>
                  {/* Chỗ này sau này map mảng variant ra */}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Giá & Số lượng</h2>
                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div className="form-control">
                    <label className="label font-semibold text-sm">
                      * Giá (₫)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleInputChange}
                      className="input input-bordered focus:border-[#ee4d2d]"
                      placeholder="Nhập giá sản phẩm"
                    />
                    <span className="text-xs text-gray-400 mt-1">
                      Giá bán chưa bao gồm khuyến mãi
                    </span>
                  </div>
                  <div className="form-control">
                    <label className="label font-semibold text-sm">
                      * Số lượng hàng
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={productForm.stock}
                      onChange={handleInputChange}
                      className="input input-bordered focus:border-[#ee4d2d]"
                      placeholder="0"
                    />
                    <span className="text-xs text-gray-400 mt-1">
                      Số lượng tồn kho hiện tại
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="form-control">
                    <label className="label font-semibold text-sm">
                      Đặt hàng tối thiểu
                    </label>
                    <input
                      type="number"
                      name="minOrder"
                      value={productForm.minOrder}
                      onChange={handleInputChange}
                      className="input input-bordered focus:border-[#ee4d2d]"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label font-semibold text-sm">
                      Mua Tối Đa
                    </label>
                    <select
                      name="maxOrder"
                      value={productForm.maxOrder}
                      onChange={handleInputChange}
                      className="select select-bordered focus:border-[#ee4d2d]"
                    >
                      <option>Không</option>
                      <option>1</option>
                      <option>2</option>
                      <option>5</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: VẬN CHUYỂN ================= */}
          {activeTab === "shipping" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-2">
                  Trọng lượng & Kích thước
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Điền chính xác để hệ thống tính phí vận chuyển.
                </p>

                <div className="grid grid-cols-4 gap-4">
                  <div className="form-control">
                    <label className="label font-semibold text-sm">
                      * Trọng lượng (gr)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={productForm.weight}
                      onChange={handleInputChange}
                      className="input input-bordered focus:border-[#ee4d2d]"
                      placeholder="500"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label font-semibold text-sm">
                      Dài (cm)
                    </label>
                    <input
                      type="number"
                      name="length"
                      value={productForm.length}
                      onChange={handleInputChange}
                      className="input input-bordered focus:border-[#ee4d2d]"
                      placeholder="L"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label font-semibold text-sm">
                      Rộng (cm)
                    </label>
                    <input
                      type="number"
                      name="width"
                      value={productForm.width}
                      onChange={handleInputChange}
                      className="input input-bordered focus:border-[#ee4d2d]"
                      placeholder="W"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label font-semibold text-sm">
                      Cao (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={productForm.height}
                      onChange={handleInputChange}
                      className="input input-bordered focus:border-[#ee4d2d]"
                      placeholder="H"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Thiết lập vận chuyển</h2>

                <div className="flex items-center justify-between mb-5 border-b pb-5">
                  <div>
                    <div className="font-semibold text-gray-800">
                      Miễn phí vận chuyển
                    </div>
                    <div className="text-sm text-gray-500">
                      Bật để shop tự chi trả phí ship cho đơn này
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    name="freeShipping"
                    className="toggle toggle-success"
                    checked={productForm.freeShipping}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <div className="font-semibold text-gray-800 mb-1">
                    Đối tác vận chuyển hỗ trợ
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    Chọn các đơn vị vận chuyển bạn muốn kích hoạt cho sản phẩm
                    này.
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 bg-gray-50 border px-3 py-2 rounded-md cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-colors">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm accent-[#ee4d2d]"
                        defaultChecked
                      />
                      <span className="text-sm font-medium">
                        Giao hàng nhanh
                      </span>
                    </label>
                    <label className="flex items-center gap-2 bg-gray-50 border px-3 py-2 rounded-md cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-colors">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm accent-[#ee4d2d]"
                        defaultChecked
                      />
                      <span className="text-sm font-medium">
                        Giao hàng tiết kiệm
                      </span>
                    </label>
                    <label className="flex items-center gap-2 bg-gray-50 border px-3 py-2 rounded-md cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-colors">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm accent-[#ee4d2d]"
                        defaultChecked
                      />
                      <span className="text-sm font-medium">Viettel Post</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: KHÁC ================= */}
          {activeTab === "other" && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-fade-in text-center py-20 text-gray-500">
              Chưa có thông tin bổ sung nào được yêu cầu.
            </div>
          )}
        </main>
      </div>

      {/* ================= THANH CÔNG CỤ (ACTION BAR) DƯỚI CÙNG - FULL WIDTH ================= */}
      <div className="fixed bottom-0 left-0 right-0 xl:left-[240px] bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <div className="w-full px-6 py-3 flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>

          {/* ================= NÚT LƯU: DISABLE KHI FORM CHƯA HỢP LỆ HOẶC ĐANG SUBMIT ================= */}
          <button
            disabled={!isFormValid() || isSubmitting}
            onClick={() => handleSubmit("HIDE")}
            className="px-6 py-2 border rounded-sm font-medium transition-colors disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed bg-[#f59e0b] border-[#f59e0b] text-white hover:bg-amber-600 flex items-center justify-center min-w-[120px]"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Lưu & Ẩn"
            )}
          </button>
          <button
            disabled={!isFormValid() || isSubmitting}
            onClick={() => handleSubmit("SHOW")}
            className="px-8 py-2 border rounded-sm font-medium transition-colors disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed bg-[#ee4d2d] border-[#ee4d2d] text-white hover:bg-[#d73211] flex items-center justify-center min-w-[140px]"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Lưu & Hiển thị"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
