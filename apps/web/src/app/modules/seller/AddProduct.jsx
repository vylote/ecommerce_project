import VariantInventoryTable from "./components/VariantInventoryTable";
import VariantGroupFields from "./components/VariantGroupFields";
import ProductInventoryFields from "./components/ProductInventoryFields";
import ProductShippingFields from "./components/ProductShippingFields";
import ProductDetailFields from "./components/ProductDetailFields";
import ProductBasicFields from "./components/ProductBasicFields";
import ProductImageFields from "./components/ProductImageFields";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Info, ArrowRight, ArrowLeft, Check, Layers } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../config/api";

const TABS = [
  { id: "basic", label: "Thông tin cơ bản" },
  { id: "detail", label: "Thông tin chi tiết" },
  { id: "sales", label: "Thông tin bán hàng" },
  { id: "shipping", label: "Vận chuyển" },
  { id: "other", label: "Thông tin khác" },
];

function buildVariants(firstOptions, secondOptions, previousVariants, { price, stock }) {
  const previousByKey = new Map(previousVariants.map((variant) => [variant.key, variant]));
  const validSecondOptions = secondOptions.filter((option) => option.trim() !== "");
  const secondValues = validSecondOptions.length ? validSecondOptions : [""];

  return firstOptions.filter((option) => option.trim() !== "").flatMap((first) =>
    secondValues.map((second) => {
      const key = second ? `${first}-${second}` : first;
      const previous = previousByKey.get(key);
      return {
        key,
        name: second ? `${first}, ${second}` : first,
        tier1Val: first,
        tier2Val: second,
        price: previous ? previous.price : price || "",
        stock: previous ? previous.stock : stock || "0",
        sku: previous ? previous.sku : "",
      };
    })
  );
}

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
  const previewUrls = useRef(new Set());

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
      } catch {
        toast.error("Không thể tải danh sách ngành hàng");
      }
    };
    void fetchCategories();
  }, []);

  // Fetch các loại đặc tả chuẩn khi người bán chọn ngành hàng
  useEffect(() => {
    const categoryId = productForm.categoryId;
    if (!categoryId) return;
    const controller = new AbortController();

    const fetchSpecTypes = async () => {
      try {
        const res = await api.get(`/categories/${categoryId}/specification-types`, { signal: controller.signal });
        if (controller.signal.aborted) return;
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
        if (!controller.signal.aborted) console.error("Lỗi tải đặc tả theo ngành hàng:", err);
      }
    };
    void fetchSpecTypes();
    return () => controller.abort();
  }, [productForm.categoryId]);

  const variantInputs = [hasVariants, tier1.options, tier2.active, tier2.options, productForm.price, productForm.stock];
  const [previousVariantInputs, setPreviousVariantInputs] = useState(variantInputs);

  if (variantInputs.some((value, index) => value !== previousVariantInputs[index])) {
    setPreviousVariantInputs(variantInputs);
    if (hasVariants) {
      setVariants(buildVariants(tier1.options, tier2.active ? tier2.options : [], variants, productForm));
    }
  }

  // Cập nhật input cơ bản
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "categoryId" && value !== productForm.categoryId) {
      setAvailableSpecTypes([]);
      setSelectedSpecs({});
      setTier1((tier) => ({ ...tier, typeId: null, options: [] }));
      setTier2((tier) => ({ ...tier, typeId: null, options: [] }));
      setVariants([]);
    }
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

    const newImages = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return { file, previewUrl };
    });

    setImageFiles((prev) => [...prev, ...newImages]);
    if (errors.imageFiles) {
      setErrors((prev) => ({ ...prev, imageFiles: null }));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (indexToRemove) => {
    const image = imageFiles[indexToRemove];
    if (!image) return;

    URL.revokeObjectURL(image.previewUrl);
    previewUrls.current.delete(image.previewUrl);
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    const urls = previewUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
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
      let uploadedPrimaryImageUrl = undefined;
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

        const uploadResults = await Promise.all(uploadPromises);
        uploadedPrimaryImageUrl = uploadResults[0]?.data?.result?.url;
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
            imageUrl: uploadedPrimaryImageUrl || undefined,
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

              <ProductImageFields
                imageFiles={imageFiles}
                fileInputRef={fileInputRef}
                error={errors.imageFiles}
                onImageChange={handleImageChange}
                onRemoveImage={removeImage}
              />

              <ProductBasicFields
                productForm={productForm}
                categories={categories}
                errors={errors}
                handleInputChange={handleInputChange}
              />

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

              <ProductDetailFields
                productForm={productForm}
                handleInputChange={handleInputChange}
                setActiveTab={setActiveTab}
                attributeSpecTypes={attributeSpecTypes}
                selectedSpecs={selectedSpecs}
                setSelectedSpecs={setSelectedSpecs}
              />

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

              {!hasVariants && (
                <ProductInventoryFields
                  productForm={productForm}
                  errors={errors}
                  onChange={handleInputChange}
                />
              )}

              {/* TRƯỜNG HỢP 2: BẬT BIẾN THỂ (VARIANTS) */}
              {hasVariants && (
                <div className="space-y-6 pt-2">
                  <VariantGroupFields
                    number={1}
                    tier={tier1}
                    specTypes={variantSpecTypes}
                    onEdit={(key, value) => setTier1((tier) => ({ ...tier, [key]: value }))}
                    onSelectType={(id) => handleSelectSpecType(1, id)}
                    onAddOption={handleAddTier1Option}
                    onRemoveOption={handleRemoveTier1Option}
                    onToggleOption={(name) => handleToggleSuggestedOption(1, name)}
                  />
                  {tier2.active ? (
                    <VariantGroupFields
                      number={2}
                      tier={tier2}
                      specTypes={variantSpecTypes}
                      excludedTypeId={tier1.typeId}
                      onEdit={(key, value) => setTier2((tier) => ({ ...tier, [key]: value }))}
                      onSelectType={(id) => handleSelectSpecType(2, id)}
                      onAddOption={handleAddTier2Option}
                      onRemoveOption={handleRemoveTier2Option}
                      onToggleOption={(name) => handleToggleSuggestedOption(2, name)}
                      onRemoveGroup={() => setTier2((tier) => ({ ...tier, active: false }))}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTier2((tier) => ({ ...tier, active: true }))}
                      className="btn btn-sm btn-outline border-gray-300"
                    >
                      Thêm nhóm phân loại 2 (ví dụ: Kích cỡ)
                    </button>
                  )}

                  <VariantInventoryTable
                    variants={variants}
                    batchPrice={batchPrice}
                    batchStock={batchStock}
                    setBatchPrice={setBatchPrice}
                    setBatchStock={setBatchStock}
                    handleApplyBatch={handleApplyBatch}
                    handleVariantChange={handleVariantChange}
                    error={errors.variants}
                  />
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
              <ProductShippingFields
                productForm={productForm}
                errors={errors}
                handleInputChange={handleInputChange}
              />

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
