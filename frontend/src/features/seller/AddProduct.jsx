import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Plus, Info, X, Trash2, ArrowRight, ArrowLeft, Check, Layers } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../shared/utils/api";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
    // Tab: Thông tin bán hàng (khi không dùng biến thể)
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

  // State danh mục từ Backend
  const [categories, setCategories] = useState([]);

  // State quản lý ảnh
  const [imageFiles, setImageFiles] = useState([]);
  const fileInputRef = useRef(null);

  // ================= 2. STATE QUẢN LÝ ĐẶC TẢ CHI TIẾT & BIẾN THỂ =================
  const [hasVariants, setHasVariants] = useState(false);
  const [availableSpecTypes, setAvailableSpecTypes] = useState([]);
  
  // Đặc tả chi tiết sản phẩm cho Tab 2: { [specTypeId]: { specificationId, isCustom, customValue } }
  const [selectedSpecs, setSelectedSpecs] = useState({});

  // Lọc đặc tả theo nhóm: Thuộc tính tĩnh (Tab 2) vs Phân loại biến thể (Tab 3)
  const attributeSpecTypes = availableSpecTypes.filter((st) => !st.isVariant);
  const variantSpecTypes = availableSpecTypes.filter((st) => st.isVariant);

  const [tier1, setTier1] = useState({
    typeId: null,
    name: "Màu sắc",
    options: [],
    inputVal: "",
  });
  const [tier2, setTier2] = useState({
    active: false,
    typeId: null,
    name: "Kích cỡ",
    options: [],
    inputVal: "",
  });

  // Mảng các biến thể thực tế (SpecificProduct)
  // Mỗi phần tử: { key: string, name: string, tier1Val: string, tier2Val: string, price: string, stock: string, sku: string }
  const [variants, setVariants] = useState([]);

  // Công cụ áp dụng nhanh cho tất cả biến thể
  const [batchPrice, setBatchPrice] = useState("");
  const [batchStock, setBatchStock] = useState("");

  // Fetch danh mục khi vào trang
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.result || []);
      } catch (error) {
        toast.error("Không thể tải danh sách ngành hàng");
      }
    };
    fetchCategories();
  }, []);

  // Fetch các loại đặc tả chuẩn khi người bán chọn ngành hàng
  useEffect(() => {
    const fetchSpecTypes = async () => {
      if (!productForm.categoryId) {
        setAvailableSpecTypes([]);
        setSelectedSpecs({});
        setTier1((prev) => ({ ...prev, typeId: null, options: [] }));
        setTier2((prev) => ({ ...prev, typeId: null, options: [] }));
        setVariants([]);
        return;
      }

      try {
        const res = await api.get(`/categories/${productForm.categoryId}/specification-types`);
        const list = res.data.result || [];
        setAvailableSpecTypes(list);

        // Lọc riêng các loại là biến thể bán hàng (Màu sắc, Kích cỡ...)
        const variantsOnly = list.filter((st) => st.isVariant);
        if (variantsOnly.length > 0) {
          // Ưu tiên tìm "Màu sắc" hoặc lấy phần tử đầu tiên làm Nhóm 1
          const colorType = variantsOnly.find((v) => v.name.toLowerCase().includes("màu")) || variantsOnly[0];
          setTier1((prev) => ({
            ...prev,
            typeId: colorType.id,
            name: colorType.name,
            options: [],
            inputVal: "",
          }));

          const remainingVariants = variantsOnly.filter((v) => v.id !== colorType.id);
          if (remainingVariants.length > 0) {
            setTier2((prev) => ({
              ...prev,
              typeId: remainingVariants[0].id,
              name: remainingVariants[0].name,
              options: [],
              inputVal: "",
            }));
          }
        } else {
          setTier1((prev) => ({ ...prev, typeId: null, name: "Phân loại 1", options: [] }));
          setTier2((prev) => ({ ...prev, typeId: null, name: "Phân loại 2", options: [] }));
        }
      } catch (err) {
        console.error("Lỗi tải đặc tả theo ngành hàng:", err);
      }
    };
    fetchSpecTypes();
  }, [productForm.categoryId]);

  // Tự động tái tạo danh sách biến thể khi tier1 / tier2 thay đổi
  useEffect(() => {
    if (!hasVariants) return;

    const opt1 = tier1.options.filter((o) => o.trim() !== "");
    const opt2 = tier2.active ? tier2.options.filter((o) => o.trim() !== "") : [];

    if (opt1.length === 0) {
      setVariants([]);
      return;
    }

    setVariants((prevVariants) => {
      const newVariants = [];

      if (!tier2.active || opt2.length === 0) {
        // Chỉ có 1 cấp biến thể
        opt1.forEach((val1) => {
          const key = val1;
          const existing = prevVariants.find((v) => v.key === key);
          newVariants.push({
            key,
            name: val1,
            tier1Val: val1,
            tier2Val: "",
            price: existing ? existing.price : productForm.price || "",
            stock: existing ? existing.stock : productForm.stock || "0",
            sku: existing ? existing.sku : "",
          });
        });
      } else {
        // Có 2 cấp biến thể
        opt1.forEach((val1) => {
          opt2.forEach((val2) => {
            const key = `${val1}-${val2}`;
            const existing = prevVariants.find((v) => v.key === key);
            newVariants.push({
              key,
              name: `${val1}, ${val2}`,
              tier1Val: val1,
              tier2Val: val2,
              price: existing ? existing.price : productForm.price || "",
              stock: existing ? existing.stock : productForm.stock || "0",
              sku: existing ? existing.sku : "",
            });
          });
        });
      }

      return newVariants;
    });
  }, [hasVariants, tier1.options, tier2.active, tier2.options]);

  // Cập nhật input cơ bản
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Upload & Xóa ảnh
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 9) {
      toast.error("Chỉ được tải lên tối đa 9 hình ảnh");
      return;
    }

    const newImages = files.map((file) => ({
      file: file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImageFiles((prev) => [...prev, ...newImages]);
    if (errors.imageFiles) {
      setErrors((prev) => ({ ...prev, imageFiles: null }));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    return () => {
      imageFiles.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, []);

  // Xử lý thêm tag giá trị phân loại
  const handleAddTier1Option = () => {
    const val = tier1.inputVal.trim();
    if (!val) return;
    if (tier1.options.includes(val)) {
      toast.error("Giá trị này đã tồn tại");
      return;
    }
    setTier1((prev) => ({
      ...prev,
      options: [...prev.options, val],
      inputVal: "",
    }));
  };

  const handleRemoveTier1Option = (indexToRemove) => {
    setTier1((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Toggle chọn nhanh giá trị đặc tả gợi ý từ sàn
  const handleToggleSuggestedOption = (tierNum, optName) => {
    if (tierNum === 1) {
      setTier1((prev) => {
        const exists = prev.options.includes(optName);
        return {
          ...prev,
          options: exists
            ? prev.options.filter((o) => o !== optName)
            : [...prev.options, optName],
        };
      });
    } else {
      setTier2((prev) => {
        const exists = prev.options.includes(optName);
        return {
          ...prev,
          options: exists
            ? prev.options.filter((o) => o !== optName)
            : [...prev.options, optName],
        };
      });
    }
  };

  // Chọn loại đặc tả chuẩn từ dropdown cho Tier (Chỉ lấy từ các loại biến thể)
  const handleSelectSpecType = (tierNum, typeId) => {
    const selected = variantSpecTypes.find((t) => t.id === Number(typeId));
    if (!selected) return;

    if (tierNum === 1) {
      setTier1((prev) => ({
        ...prev,
        typeId: selected.id,
        name: selected.name,
        options: [], // Clear options cũ khi đổi loại biến thể
        inputVal: "",
      }));
    } else {
      setTier2((prev) => ({
        ...prev,
        typeId: selected.id,
        name: selected.name,
        options: [], // Clear options cũ khi đổi loại biến thể
        inputVal: "",
      }));
    }
  };

  const handleAddTier2Option = () => {
    const val = tier2.inputVal.trim();
    if (!val) return;
    if (tier2.options.includes(val)) {
      toast.error("Giá trị này đã tồn tại");
      return;
    }
    setTier2((prev) => ({
      ...prev,
      options: [...prev.options, val],
      inputVal: "",
    }));
  };

  const handleRemoveTier2Option = (indexToRemove) => {
    setTier2((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Cập nhật từng ô trong bảng biến thể
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Áp dụng hàng loạt giá & kho cho toàn bộ biến thể
  const handleApplyBatch = () => {
    if (!batchPrice && !batchStock) {
      toast.error("Vui lòng nhập giá hoặc kho cần áp dụng");
      return;
    }
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        price: batchPrice !== "" ? batchPrice : v.price,
        stock: batchStock !== "" ? batchStock : v.stock,
      }))
    );
    toast.success("Đã áp dụng cho toàn bộ biến thể!");
  };

  // ================= 3. STEP VALIDATION LOGIC =================
  const validateTab = (tabId) => {
    const newErrors = {};

    if (tabId === "basic") {
      if (!productForm.name.trim()) newErrors.name = "Vui lòng nhập tên sản phẩm";
      if (!productForm.categoryId) newErrors.categoryId = "Vui lòng chọn ngành hàng";
      if (!productForm.description.trim()) newErrors.description = "Vui lòng nhập mô tả sản phẩm";
      if (imageFiles.length === 0) newErrors.imageFiles = "Vui lòng tải lên ít nhất 1 hình ảnh";

      if (Object.keys(newErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...newErrors }));
        toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc ở mục Thông tin cơ bản");
        return false;
      }
    }

    if (tabId === "sales") {
      if (!hasVariants) {
        if (!productForm.price || Number(productForm.price) <= 0) {
          newErrors.price = "Giá sản phẩm phải lớn hơn 0";
        }
        if (productForm.stock === "" || Number(productForm.stock) < 0) {
          newErrors.stock = "Số lượng hàng không hợp lệ";
        }
      } else {
        if (variants.length === 0) {
          newErrors.variants = "Cần tạo ít nhất 1 biến thể phân loại hàng";
        } else {
          const hasInvalidVariant = variants.some(
            (v) => !v.price || Number(v.price) <= 0 || v.stock === "" || Number(v.stock) < 0
          );
          if (hasInvalidVariant) {
            newErrors.variants = "Vui lòng nhập đầy đủ giá (>0) và tồn kho (>=0) cho tất cả biến thể";
          }
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...newErrors }));
        toast.error("Vui lòng hoàn thành giá và số lượng bán hàng trước khi tiếp tục");
        return false;
      }
    }

    if (tabId === "shipping") {
      if (!productForm.weight || Number(productForm.weight) <= 0) {
        newErrors.weight = "Vui lòng nhập trọng lượng sản phẩm (> 0 gr)";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...newErrors }));
        toast.error("Vui lòng nhập trọng lượng sản phẩm");
        return false;
      }
    }

    return true;
  };

  // Điều hướng chuyển Tab
  const handleTabClick = (targetTabId) => {
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
    const targetIndex = TABS.findIndex((t) => t.id === targetTabId);

    // Nếu quay lại các tab trước thì luôn cho phép
    if (targetIndex <= currentIndex) {
      setActiveTab(targetTabId);
      return;
    }

    // Nếu muốn tiến tới: phải validate tab hiện tại trước
    if (validateTab(activeTab)) {
      setActiveTab(targetTabId);
    }
  };

  const handleNextTab = () => {
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
    if (validateTab(activeTab) && currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1].id);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1].id);
    }
  };

  // ================= 4. HÀM XỬ LÝ LƯU SẢN PHẨM =================
  const handleSubmit = async (mode) => {
    // Validate toàn bộ các Tab trước khi gửi
    if (!validateTab("basic")) {
      setActiveTab("basic");
      return;
    }
    if (!validateTab("sales")) {
      setActiveTab("sales");
      return;
    }
    if (!validateTab("shipping")) {
      setActiveTab("shipping");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Tính toán giá và tổng tồn kho của sản phẩm cha
      let finalPrice = Number(productForm.price) || 0;
      let finalStock = Number(productForm.stock) || 0;

      if (hasVariants && variants.length > 0) {
        // Giá sản phẩm cha là giá thấp nhất của các biến thể
        finalPrice = Math.min(...variants.map((v) => Number(v.price) || 0));
        // Tổng tồn kho bằng tổng số lượng của các biến thể
        finalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      }

      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: finalPrice,
        stockQuantity: finalStock,
        categoryId: Number(productForm.categoryId),
        status: mode === "HIDE" ? "INACTIVE" : "ACTIVE",
      };

      // 2. Tạo sản phẩm gốc
      const res = await api.post("/products", payload);
      const newProductId = res.data.result.id;

      // 3. Upload hình ảnh sản phẩm
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map((imgObj, index) => {
          const formData = new FormData();
          formData.append("file", imgObj.file);
          formData.append("isPrimary", index === 0);
          formData.append("sortOrder", index);

          return api.post(`/products/${newProductId}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        });

        await Promise.all(uploadPromises);
      }

      // 3.1. Lưu các thuộc tính đặc tả chi tiết sản phẩm (Tab 2: Thông tin chi tiết)
      const specEntries = Object.values(selectedSpecs).filter(
        (item) => item.specificationId || (item.isCustom && item.customValue?.trim())
      );
      if (specEntries.length > 0) {
        const specPromises = specEntries.map((item) =>
          api.post(`/products/${newProductId}/specifications`, {
            specificationId: item.specificationId || undefined,
            customValue: item.customValue?.trim() || undefined,
          }).catch((err) => console.warn("Lỗi lưu đặc tả sản phẩm:", err))
        );
        await Promise.all(specPromises);
      }

      // 4. Nếu có biến thể -> Tạo danh sách SpecificProduct và phiếu nhập kho ban đầu
      if (hasVariants && variants.length > 0) {
        const createdVariants = [];

        for (const v of variants) {
          const variantRes = await api.post(`/products/${newProductId}/variants`, {
            name: v.name,
            sku: v.sku.trim() || undefined,
            price: Number(v.price),
            imageUrl: imageFiles[0]?.previewUrl || undefined,
            isActive: true,
          });
          createdVariants.push({
            id: variantRes.data.result.id,
            stock: Number(v.stock) || 0,
            price: Number(v.price),
          });
        }

        // 5. Khởi tạo phiếu nhập kho ban đầu (Hình thức 1: Người bán tự giữ kho riêng)
        const receiptDetails = createdVariants
          .filter((cv) => cv.stock > 0)
          .map((cv) => ({
            specificProductId: cv.id,
            quantity: cv.stock,
            importPrice: Math.round(cv.price * 0.7), // Giá vốn ước tính
          }));

        if (receiptDetails.length > 0) {
          try {
            await api.post("/import-receipts", {
              productId: newProductId,
              note: "Khởi tạo tồn kho ban đầu khi tạo sản phẩm mới",
              status: "COMPLETED",
              details: receiptDetails,
            });
          } catch (receiptError) {
            console.warn("Không thể tự động tạo phiếu nhập kho ban đầu:", receiptError);
          }
        }
      }

      toast.success(
        mode === "HIDE"
          ? "Đã lưu sản phẩm ở chế độ Ẩn thành công!"
          : "Đã tạo và hiển thị sản phẩm mới thành công!"
      );
      navigate("/seller/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-28 animate-fade-in max-w-6xl mx-auto">
      {/* Title trang */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Thêm 1 sản phẩm mới</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Điền thông tin và tạo các biến thể để bắt đầu bán hàng trên sàn
          </p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* ================= SIDEBAR GỢI Ý ================= */}
        <aside className="w-full xl:w-[280px] bg-white border border-gray-200 rounded-lg p-5 shadow-sm shrink-0 sticky top-20">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Info size={18} className="text-green-600" /> Hướng dẫn thêm sản phẩm
          </h3>
          <ul className="text-sm text-gray-600 space-y-2.5 mb-6 list-disc pl-4">
            <li>Tải lên ít nhất 1 ảnh bìa rõ nét.</li>
            <li>Đặt tên sản phẩm ngắn gọn, từ 25 - 100 ký tự.</li>
            <li>Bật phân loại nếu sản phẩm có nhiều màu sắc hoặc kích cỡ.</li>
            <li>Điền đúng trọng lượng để hệ thống tính phí vận chuyển chuẩn.</li>
          </ul>

          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-xs text-green-800">
            💡 <strong>Mẹo kho hàng:</strong> Sản phẩm có biến thể sẽ tự động được khởi tạo số lượng tồn ban đầu theo danh sách bạn nhập.
          </div>
        </aside>

        {/* ================= KHU VỰC CHÍNH ================= */}
        <main className="flex-1 min-w-0 w-full">
          {/* TABS HEADER */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1 border-b border-gray-200">
            {TABS.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              const hasTabError =
                (tab.id === "basic" && (errors.name || errors.categoryId || errors.description || errors.imageFiles)) ||
                (tab.id === "sales" && (errors.price || errors.stock || errors.variants)) ||
                (tab.id === "shipping" && errors.weight);

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-4 py-2.5 font-medium text-sm transition-all whitespace-nowrap border-b-2 relative flex items-center gap-2 ${
                    isActive
                      ? "border-green-600 text-green-700 font-bold bg-white"
                      : "border-transparent text-gray-600 hover:text-green-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{idx + 1}. {tab.label}</span>
                  {hasTabError && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ================= TAB 1: THÔNG TIN CƠ BẢN ================= */}
          {activeTab === "basic" && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-fade-in space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">Thông tin cơ bản</h2>

              {/* Upload ảnh */}
              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-2">
                  Hình ảnh sản phẩm ({imageFiles.length}/9) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3 items-center">
                  {imageFiles.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 border rounded-md overflow-hidden group shadow-sm"
                    >
                      <img
                        src={img.previewUrl}
                        alt={`preview-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X size={14} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[10px] font-semibold text-center py-0.5">
                          Ảnh bìa
                        </span>
                      )}
                    </div>
                  ))}

                  {imageFiles.length < 9 && (
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className={`w-24 h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        errors.imageFiles
                          ? "border-red-400 bg-red-50 text-red-500"
                          : "border-green-600 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      <Plus size={24} />
                      <span className="text-xs mt-1 font-medium">Thêm ảnh</span>
                    </div>
                  )}
                </div>
                {errors.imageFiles && (
                  <p className="text-xs text-red-500 mt-1.5">{errors.imageFiles}</p>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </div>

              {/* Tên sản phẩm */}
              <div className="form-control">
                <label className="label font-semibold text-sm">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  className={`input input-bordered ${errors.name ? "border-red-500 focus:border-red-500" : "focus:border-green-600"}`}
                  placeholder="Nhập tên sản phẩm (Ví dụ: Áo thun Polo Nam thoáng khí...)"
                />
                {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
              </div>

              {/* Ngành hàng */}
              <div className="form-control">
                <label className="label font-semibold text-sm">
                  Ngành hàng <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={productForm.categoryId}
                  onChange={handleInputChange}
                  className={`select select-bordered ${errors.categoryId ? "border-red-500 focus:border-red-500" : "focus:border-green-600"}`}
                >
                  <option value="">-- Chọn ngành hàng phù hợp --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <span className="text-xs text-red-500 mt-1">{errors.categoryId}</span>
                )}
              </div>

              {/* Mô tả */}
              <div className="form-control">
                <label className="label font-semibold text-sm">
                  Mô tả sản phẩm <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  className={`textarea textarea-bordered h-36 ${errors.description ? "border-red-500 focus:border-red-500" : "focus:border-green-600"}`}
                  placeholder="Nhập mô tả sản phẩm chi tiết về chất liệu, tính năng, cách bảo quản..."
                ></textarea>
                {errors.description && (
                  <span className="text-xs text-red-500 mt-1">{errors.description}</span>
                )}
              </div>

              {/* Nút Next */}
              <div className="pt-4 border-t flex justify-end">
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="btn bg-green-600 hover:bg-green-700 text-white gap-2 px-6"
                >
                  Tiếp theo: Thông tin chi tiết <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: THÔNG TIN CHI TIẾT (OPTIONAL) ================= */}
          {activeTab === "detail" && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-fade-in space-y-6">
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Thông tin chi tiết sản phẩm</h2>
                  <p className="text-xs text-gray-500">
                    Điền các thông số kỹ thuật & thuộc tính giúp người mua dễ dàng tìm kiếm và tin tưởng sản phẩm của bạn hơn.
                  </p>
                </div>
              </div>

              {!productForm.categoryId ? (
                <div className="p-6 text-center bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                  <p className="font-semibold text-sm">⚠️ Chưa chọn ngành hàng</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Vui lòng quay lại <strong>Tab 1: Thông tin cơ bản</strong> và chọn ngành hàng để tải các thông số chi tiết phù hợp.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("basic")}
                    className="btn btn-sm bg-amber-600 hover:bg-amber-700 text-white mt-3"
                  >
                    Quay lại chọn ngành hàng
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Các trường cơ bản chung */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-control">
                      <label className="label font-medium text-sm">Thương hiệu</label>
                      <input
                        type="text"
                        name="brand"
                        value={productForm.brand}
                        onChange={handleInputChange}
                        className="input input-bordered focus:border-green-600"
                        placeholder="Ví dụ: No Brand, OEM, Nike, Apple..."
                      />
                    </div>

                    <div className="form-control">
                      <label className="label font-medium text-sm">Nhà sản xuất / Đơn vị phân phối</label>
                      <input
                        type="text"
                        name="manufacturer"
                        value={productForm.manufacturer}
                        onChange={handleInputChange}
                        className="input input-bordered focus:border-green-600"
                        placeholder="Tên công ty hoặc cơ sở sản xuất"
                      />
                    </div>
                  </div>

                  {/* CÁC THUỘC TÍNH ĐẶC TẢ ĐỘNG THEO NGÀNH HÀNG */}
                  {attributeSpecTypes.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span>Đặc tả thông số chuẩn theo ngành hàng ({attributeSpecTypes.length} thuộc tính):</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {attributeSpecTypes.map((st) => {
                          const currentSpec = selectedSpecs[st.id] || {};
                          return (
                            <div key={st.id} className="form-control">
                              <label className="label font-medium text-sm">
                                <span>{st.name}</span>
                                {st.description && (
                                  <span className="text-[11px] text-gray-400 font-normal ml-1">({st.description})</span>
                                )}
                              </label>
                              <div className="space-y-2">
                                <select
                                  value={currentSpec.specificationId || (currentSpec.isCustom ? "CUSTOM" : "")}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "CUSTOM") {
                                      setSelectedSpecs((prev) => ({
                                        ...prev,
                                        [st.id]: { specificationId: null, isCustom: true, customValue: "" },
                                      }));
                                    } else if (!val) {
                                      setSelectedSpecs((prev) => {
                                        const next = { ...prev };
                                        delete next[st.id];
                                        return next;
                                      });
                                    } else {
                                      const specObj = st.specifications?.find((s) => s.id === Number(val));
                                      setSelectedSpecs((prev) => ({
                                        ...prev,
                                        [st.id]: {
                                          specificationId: Number(val),
                                          specificationName: specObj?.name,
                                          isCustom: false,
                                          customValue: "",
                                        },
                                      }));
                                    }
                                  }}
                                  className="select select-bordered w-full focus:border-green-600 text-sm"
                                >
                                  <option value="">-- Chọn {st.name} (Tùy chọn) --</option>
                                  {st.specifications?.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.name} {s.description ? `(${s.description})` : ""}
                                    </option>
                                  ))}
                                  <option value="CUSTOM">-- Tự nhập giá trị khác --</option>
                                </select>

                                {currentSpec.isCustom && (
                                  <input
                                    type="text"
                                    value={currentSpec.customValue || ""}
                                    onChange={(e) => {
                                      const customVal = e.target.value;
                                      setSelectedSpecs((prev) => ({
                                        ...prev,
                                        [st.id]: { ...prev[st.id], customValue: customVal },
                                      }));
                                    }}
                                    className="input input-bordered input-sm w-full focus:border-green-600 text-sm"
                                    placeholder={`Nhập giá trị tùy chỉnh cho ${st.name}...`}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Nút điều hướng */}
              <div className="pt-4 border-t flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevTab}
                  className="btn btn-outline border-gray-300 gap-2"
                >
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="btn bg-green-600 hover:bg-green-700 text-white gap-2 px-6"
                >
                  Tiếp theo: Bán hàng & Biến thể <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 3: THÔNG TIN BÁN HÀNG & BIẾN THỂ ================= */}
          {activeTab === "sales" && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-fade-in space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Layers size={20} className="text-green-600" /> Phân loại hàng (Biến thể)
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Bật tùy chọn này nếu sản phẩm có nhiều màu sắc, kích cỡ, phân loại với giá bán hoặc tồn kho riêng biệt.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {hasVariants ? "Đang bật biến thể" : "Không có biến thể"}
                  </span>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                  />
                </div>
              </div>

              {/* Cảnh báo nếu chưa chọn ngành hàng */}
              {!productForm.categoryId && hasVariants && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                  ⚠️ <strong>Chưa chọn ngành hàng:</strong> Vui lòng quay lại Tab 1 để chọn ngành hàng trước. Hệ thống sẽ lọc đúng các nhóm biến thể hợp lệ (như Màu sắc, Kích cỡ...).
                </div>
              )}

              {/* TRƯỜNG HỢP 1: KHÔNG DÙNG BIẾN THỂ */}
              {!hasVariants && (
                <div className="grid grid-cols-2 gap-5 pt-2">
                  <div className="form-control">
                    <label className="label font-semibold text-sm">
                      Giá bán (₫) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleInputChange}
                      className={`input input-bordered ${errors.price ? "border-red-500 focus:border-red-500" : "focus:border-green-600"}`}
                      placeholder="Ví dụ: 150000"
                    />
                    {errors.price && <span className="text-xs text-red-500 mt-1">{errors.price}</span>}
                  </div>

                  <div className="form-control">
                    <label className="label font-semibold text-sm">
                      Số lượng hàng sẵn có tại kho <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={productForm.stock}
                      onChange={handleInputChange}
                      className={`input input-bordered ${errors.stock ? "border-red-500 focus:border-red-500" : "focus:border-green-600"}`}
                      placeholder="Ví dụ: 50"
                    />
                    {errors.stock && <span className="text-xs text-red-500 mt-1">{errors.stock}</span>}
                  </div>
                </div>
              )}

              {/* TRƯỜNG HỢP 2: BẬT BIẾN THỂ (VARIANTS) */}
              {hasVariants && (
                <div className="space-y-6 pt-2">
                  {/* Nhóm phân loại 1 */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/60 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-sm font-bold text-gray-800">Nhóm phân loại 1</label>
                      {variantSpecTypes.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Chuẩn theo ngành hàng:</span>
                          <select
                            value={tier1.typeId || ""}
                            onChange={(e) => handleSelectSpecType(1, e.target.value)}
                            className="select select-bordered select-xs bg-white text-xs font-semibold focus:border-green-600"
                          >
                            <option value="">-- Chọn phân loại chuẩn --</option>
                            {variantSpecTypes.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.name} ({st.specifications?.length || 0} giá trị)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 items-center">
                      <input
                        type="text"
                        value={tier1.name}
                        onChange={(e) => setTier1({ ...tier1, name: e.target.value })}
                        className="input input-bordered input-sm bg-white focus:border-green-600 font-medium"
                        placeholder="Tên nhóm (Màu sắc...)"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tier1.inputVal}
                          onChange={(e) => setTier1({ ...tier1, inputVal: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTier1Option())}
                          className="input input-bordered input-sm bg-white flex-1 focus:border-green-600"
                          placeholder="Hoặc gõ thêm giá trị riêng (Đỏ, Xanh...) rồi bấm Thêm"
                        />
                        <button
                          type="button"
                          onClick={handleAddTier1Option}
                          className="btn btn-sm bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Plus size={16} /> Thêm
                        </button>
                      </div>
                    </div>

                    {/* GỢI Ý GIÁ TRỊ CHUẨN TỪ SÀN CHO NHÓM 1 */}
                    {(() => {
                      const currentType = variantSpecTypes.find((t) => t.id === tier1.typeId || t.name === tier1.name);
                      if (!currentType || !currentType.specifications || currentType.specifications.length === 0) return null;
                      return (
                        <div className="pt-1.5 pb-1 border-t border-gray-200/60">
                          <div className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                            <span>✨ Gợi ý chuẩn từ sàn ({currentType.name}) - Click để chọn nhanh:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {currentType.specifications.map((s) => {
                              const isSelected = tier1.options.includes(s.name);
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => handleToggleSuggestedOption(1, s.name)}
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                                    isSelected
                                      ? "bg-green-600 border-green-600 text-white shadow-xs"
                                      : "bg-white border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-600"
                                  }`}
                                >
                                  {s.name} {isSelected ? "✓" : "+"}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Danh sách chip giá trị đã chọn */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {tier1.options.map((opt, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-semibold text-gray-700 shadow-sm"
                        >
                          {opt}
                          <button
                            type="button"
                            onClick={() => handleRemoveTier1Option(idx)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Nhóm phân loại 2 (Tùy chọn) */}
                  {tier2.active ? (
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/60 space-y-3 relative">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-sm font-bold text-gray-800">Nhóm phân loại 2</label>
                        <div className="flex items-center gap-3">
                          {variantSpecTypes.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Chuẩn theo ngành hàng:</span>
                              <select
                                value={tier2.typeId || ""}
                                onChange={(e) => handleSelectSpecType(2, e.target.value)}
                                className="select select-bordered select-xs bg-white text-xs font-semibold focus:border-green-600"
                              >
                                <option value="">-- Chọn phân loại chuẩn --</option>
                                {variantSpecTypes
                                  .filter((st) => st.id !== tier1.typeId)
                                  .map((st) => (
                                    <option key={st.id} value={st.id}>
                                      {st.name} ({st.specifications?.length || 0} giá trị)
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setTier2({ ...tier2, active: false })}
                            className="text-xs text-red-500 hover:underline flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Xóa nhóm 2
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 items-center">
                        <input
                          type="text"
                          value={tier2.name}
                          onChange={(e) => setTier2({ ...tier2, name: e.target.value })}
                          className="input input-bordered input-sm bg-white focus:border-green-600 font-medium"
                          placeholder="Tên nhóm (Kích cỡ...)"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tier2.inputVal}
                            onChange={(e) => setTier2({ ...tier2, inputVal: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTier2Option())}
                            className="input input-bordered input-sm bg-white flex-1 focus:border-green-600"
                            placeholder="Hoặc gõ thêm giá trị (S, M, L, XL...) rồi bấm Thêm"
                          />
                          <button
                            type="button"
                            onClick={handleAddTier2Option}
                            className="btn btn-sm bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Plus size={16} /> Thêm
                          </button>
                        </div>
                      </div>

                      {/* GỢI Ý GIÁ TRỊ CHUẨN TỪ SÀN CHO NHÓM 2 */}
                      {(() => {
                        const currentType = variantSpecTypes.find((t) => t.id === tier2.typeId || t.name === tier2.name);
                        if (!currentType || !currentType.specifications || currentType.specifications.length === 0) return null;
                        return (
                          <div className="pt-1.5 pb-1 border-t border-gray-200/60">
                            <div className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                              <span>✨ Gợi ý chuẩn từ sàn ({currentType.name}) - Click để chọn nhanh:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {currentType.specifications.map((s) => {
                                const isSelected = tier2.options.includes(s.name);
                                return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleToggleSuggestedOption(2, s.name)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                                      isSelected
                                        ? "bg-green-600 border-green-600 text-white shadow-xs"
                                        : "bg-white border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-600"
                                    }`}
                                  >
                                    {s.name} {isSelected ? "✓" : "+"}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Danh sách chip nhóm 2 */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {tier2.options.map((opt, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-semibold text-gray-700 shadow-sm"
                          >
                            {opt}
                            <button
                              type="button"
                              onClick={() => handleRemoveTier2Option(idx)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTier2({ ...tier2, active: true })}
                      className="btn btn-sm btn-outline border-dashed border-green-600 text-green-700 hover:bg-green-50 w-full"
                    >
                      <Plus size={16} /> Thêm nhóm phân loại 2 (Ví dụ: Kích cỡ, Size)
                    </button>
                  )}

                  {/* BẢNG MA TRẬN BIẾN THỂ */}
                  {variants.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-green-50 border border-green-200 p-3 rounded-lg">
                        <span className="text-xs font-bold text-green-900">
                          Áp dụng nhanh cho tất cả {variants.length} phân loại:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="number"
                            value={batchPrice}
                            onChange={(e) => setBatchPrice(e.target.value)}
                            placeholder="Giá chung (₫)"
                            className="input input-bordered input-xs w-28 bg-white"
                          />
                          <input
                            type="number"
                            value={batchStock}
                            onChange={(e) => setBatchStock(e.target.value)}
                            placeholder="Kho chung"
                            className="input input-bordered input-xs w-24 bg-white"
                          />
                          <button
                            type="button"
                            onClick={handleApplyBatch}
                            className="btn btn-xs bg-green-600 hover:bg-green-700 text-white font-medium"
                          >
                            Áp dụng
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="table table-compact w-full text-sm">
                          <thead className="bg-gray-100 text-gray-700 font-semibold">
                            <tr>
                              <th className="py-3 px-4">Tên phân loại hàng</th>
                              <th className="py-3 px-4">Giá bán (₫) *</th>
                              <th className="py-3 px-4">Kho ban đầu *</th>
                              <th className="py-3 px-4">Mã SKU (Tùy chọn)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {variants.map((v, idx) => (
                              <tr key={v.key} className="hover:bg-gray-50/60">
                                <td className="py-2.5 px-4 font-semibold text-gray-800">
                                  {v.name}
                                </td>
                                <td className="py-2.5 px-4 w-44">
                                  <input
                                    type="number"
                                    value={v.price}
                                    onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                                    placeholder="Giá bán"
                                    className="input input-bordered input-sm w-full focus:border-green-600"
                                  />
                                </td>
                                <td className="py-2.5 px-4 w-36">
                                  <input
                                    type="number"
                                    value={v.stock}
                                    onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                                    placeholder="Số lượng"
                                    className="input input-bordered input-sm w-full focus:border-green-600"
                                  />
                                </td>
                                <td className="py-2.5 px-4">
                                  <input
                                    type="text"
                                    value={v.sku}
                                    onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                                    placeholder="SKU tự động"
                                    className="input input-bordered input-sm w-full focus:border-green-600"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {errors.variants && (
                        <p className="text-xs text-red-500 font-medium">{errors.variants}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Nút điều hướng */}
              <div className="pt-4 border-t flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevTab}
                  className="btn btn-outline border-gray-300 gap-2"
                >
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="btn bg-green-600 hover:bg-green-700 text-white gap-2 px-6"
                >
                  Tiếp theo: Vận chuyển <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 4: VẬN CHUYỂN ================= */}
          {activeTab === "shipping" && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-fade-in space-y-6">
              <div className="border-b pb-3">
                <h2 className="text-lg font-bold text-gray-800">Kích thước & Trọng lượng</h2>
                <p className="text-xs text-gray-500">
                  Cung cấp trọng lượng sau khi đóng gói để sàn tính phí vận chuyển chính xác cho khách hàng.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="form-control">
                  <label className="label font-semibold text-sm">
                    Trọng lượng (gr) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={productForm.weight}
                    onChange={handleInputChange}
                    className={`input input-bordered ${errors.weight ? "border-red-500 focus:border-red-500" : "focus:border-green-600"}`}
                    placeholder="Ví dụ: 300"
                  />
                  {errors.weight && <span className="text-xs text-red-500 mt-1">{errors.weight}</span>}
                </div>

                <div className="form-control">
                  <label className="label font-medium text-sm">Dài (cm)</label>
                  <input
                    type="number"
                    name="length"
                    value={productForm.length}
                    onChange={handleInputChange}
                    className="input input-bordered focus:border-green-600"
                    placeholder="L"
                  />
                </div>

                <div className="form-control">
                  <label className="label font-medium text-sm">Rộng (cm)</label>
                  <input
                    type="number"
                    name="width"
                    value={productForm.width}
                    onChange={handleInputChange}
                    className="input input-bordered focus:border-green-600"
                    placeholder="W"
                  />
                </div>

                <div className="form-control">
                  <label className="label font-medium text-sm">Cao (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={productForm.height}
                    onChange={handleInputChange}
                    className="input input-bordered focus:border-green-600"
                    placeholder="H"
                  />
                </div>
              </div>

              {/* Đối tác vận chuyển */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-3">
                <h3 className="font-semibold text-sm text-gray-800">Đơn vị vận chuyển hỗ trợ</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="checkbox checkbox-sm accent-green-600" />
                    <span>Giao hàng nhanh (GHN)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="checkbox checkbox-sm accent-green-600" />
                    <span>Giao hàng tiết kiệm (GHTK)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="checkbox checkbox-sm accent-green-600" />
                    <span>Viettel Post</span>
                  </label>
                </div>
              </div>

              {/* Nút điều hướng */}
              <div className="pt-4 border-t flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevTab}
                  className="btn btn-outline border-gray-300 gap-2"
                >
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="btn bg-green-600 hover:bg-green-700 text-white gap-2 px-6"
                >
                  Tiếp theo: Thông tin khác <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 5: KHÁC ================= */}
          {activeTab === "other" && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-fade-in space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">Thông tin bổ sung</h2>
              <div className="py-12 text-center text-gray-500">
                <Check size={40} className="mx-auto text-green-600 mb-2" />
                <p className="font-medium text-gray-700">Tất cả thông tin cần thiết đã sẵn sàng!</p>
                <p className="text-xs text-gray-400 mt-1">
                  Bạn có thể kiểm tra lại các mục hoặc bấm nút bên dưới để chính thức đăng tải sản phẩm.
                </p>
              </div>

              {/* Nút điều hướng */}
              <div className="pt-4 border-t flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevTab}
                  className="btn btn-outline border-gray-300 gap-2"
                >
                  <ArrowLeft size={16} /> Quay lại
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= THANH CÔNG CỤ ACTION BAR DƯỚI CÙNG ================= */}
      <div className="fixed bottom-0 left-0 right-0 xl:left-[240px] bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.06)] z-50">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <div className="text-xs text-gray-500 hidden sm:block">
            {hasVariants ? `Đang có ${variants.length} phân loại hàng` : "Sản phẩm đơn (Không biến thể)"}
          </div>

          <div className="flex gap-3 ml-auto">
            <button
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="px-5 py-2 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              Hủy
            </button>

            <button
              disabled={isSubmitting}
              onClick={() => handleSubmit("HIDE")}
              className="px-6 py-2 border rounded font-medium transition-colors bg-amber-500 border-amber-500 text-white hover:bg-amber-600 flex items-center justify-center min-w-[120px] text-sm shadow-sm"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Lưu & Ẩn"
              )}
            </button>

            <button
              disabled={isSubmitting}
              onClick={() => handleSubmit("SHOW")}
              className="px-7 py-2 border rounded font-semibold transition-colors bg-green-600 border-green-600 text-white hover:bg-green-700 flex items-center justify-center min-w-[140px] text-sm shadow-sm"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Lưu & Hiển thị"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
