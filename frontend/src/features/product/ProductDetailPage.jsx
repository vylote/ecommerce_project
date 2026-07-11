import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // THÊM IMPORT NÀY
import toast from "react-hot-toast"; // THÊM IMPORT NÀY
import Navbar from "../../shared/components/Navbar";
import api from "../../shared/utils/api";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth); // Lấy thông tin user

  const [product, setProduct] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [currentCategoryName, setCurrentCategoryName] = useState("Khác");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [filterRating, setFilterRating] = useState("all");
  const [shopProductCount, setShopProductCount] = useState(0);

  // STATE MỚI: Quản lý số lượng muốn mua
  const [quantity, setQuantity] = useState(1);

  // STATE & REF CAROUSEL ẢNH
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const thumbRefs = useRef([]);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const [productRes, reviewRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/reviews`, { params: { page: 1, size: 5 } }),
        ]);

        const prodData = productRes.data.result;
        setProduct(prodData); // Thông tin Shop đã nằm sẵn trong prodData.shop
        setReviews(reviewRes.data.result.data);
        setReviewTotalPages(reviewRes.data.result.totalPages);
        setCurrentImageIndex(0);

        // Gọi API lấy danh sách sản phẩm của Shop để đếm số lượng
        if (prodData.shop?.id) {
          api.get(`/shops/${prodData.shop.id}/products`)
            .then(res => {
              setShopProductCount(res.data.result?.length || 0);
            })
            .catch(err => console.error("Lỗi lấy số sản phẩm của shop:", err));
        }

        const catId = prodData.category?.id || prodData.categoryId;
        if (catId) {
          const categoryRes = await api.get(`/categories/${catId}`);
          setBreadcrumbs(categoryRes.data.result.breadcrumbs || []);
          setCurrentCategoryName(
            categoryRes.data.result.name || prodData.category?.name || "Khác",
          );
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  const loadReviews = async (pageToLoad, ratingToFilter = filterRating) => {
    try {
      const params = { page: pageToLoad, size: 5 };
      if (ratingToFilter !== "all") {
        params.rating = ratingToFilter;
      }
      const res = await api.get(`/products/${id}/reviews`, { params });
      setReviews(res.data.result.data);
      setReviewPage(pageToLoad);
      setReviewTotalPages(res.data.result.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilterChange = (rating) => {
    setFilterRating(rating);
    loadReviews(1, rating);
  };

  // --- LOGIC THÊM VÀO GIỎ HÀNG ---
  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      navigate("/login");
      return;
    }

    try {
      await api.post("/cart/items", {
        productId: product.id,
        quantity: quantity,
      });

      toast.success("Đã thêm vào giỏ hàng");

      // Bắn pháo hiệu (Event) để Navbar biết đường tải lại số lượng
      window.dispatchEvent(new Event("cart_updated"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      navigate("/login");
      return;
    }
    // Logic mua ngay: Gọi add to cart rồi chuyển trang sang Cart
    await handleAddToCart();
    navigate("/cart");
  };

  // LOGIC ĐIỀU KHIỂN CAROUSEL
  const sortedImages = product?.images
    ? [...product.images].sort(
        (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0),
      )
    : [];
  const totalImages = sortedImages.length;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (totalImages <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(autoPlayRef.current);
  }, [totalImages, currentImageIndex]);

  useEffect(() => {
    if (thumbRefs.current[currentImageIndex]) {
      thumbRefs.current[currentImageIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [currentImageIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <Navbar />
        <div className="max-w-[1200px] mx-auto py-5 flex justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  if (!product)
    return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;

  const shop = product.shop;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-10">
      <Navbar />

      <div className="max-w-[1200px] mx-auto mt-5">
        {/* KHỐI 1: KHUNG ẢNH VÀ THÔNG TIN CƠ BẢN */}
        <div className="bg-white p-4 rounded-sm shadow-[0_1px_1px_0_rgba(0,0,0,0.05)] mb-4 flex gap-6">
          <div className="w-[400px] shrink-0">
            <div className="w-[400px] h-[400px] bg-base-200 relative overflow-hidden mb-3">
              {totalImages > 0 ? (
                <>
                  <img
                    src={sortedImages[currentImageIndex]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />

                  {totalImages > 1 && (
                    <>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {sortedImages.map((_, idx) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? "bg-primary" : "bg-white/70"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
                  📦
                </div>
              )}
            </div>

            {totalImages > 0 && (
              <div className="relative w-full">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
                  {sortedImages.map((img, idx) => (
                    <div
                      key={img.id}
                      ref={el => thumbRefs.current[idx] = el}
                      onMouseEnter={() => setCurrentImageIndex(idx)}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-[73.6px] h-[73.6px] shrink-0 cursor-pointer border-2 transition-all ${currentImageIndex === idx ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                {totalImages > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      aria-label="Ảnh trước"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white/80 hover:bg-white text-base-content rounded-full opacity-70 hover:opacity-100 transition-opacity shadow-[0_1px_4px_rgba(0,0,0,0.25)] z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      aria-label="Ảnh tiếp theo"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white/80 hover:bg-white text-base-content rounded-full opacity-70 hover:opacity-100 transition-opacity shadow-[0_1px_4px_rgba(0,0,0,0.25)] z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 py-2">
            <h1 className="text-xl font-medium mb-3">{product.name}</h1>
            <div className="flex items-center text-sm gap-4 mb-4 text-base-content/70">
              <div className="flex items-center text-warning font-medium border-b border-warning pb-0.5">
                <span className="mr-1">{product.averageRating || "0.0"}</span> ★
              </div>
              <div className="w-px h-4 bg-base-300"></div>
              <div className="border-b border-base-content pb-0.5">
                <span className="text-base-content">
                  {product.reviewCount || 0}
                </span>{" "}
                Đánh giá
              </div>
              <div className="w-px h-4 bg-base-300"></div>
              <div>
                <span className="text-base-content">
                  {product.soldCount || 0}
                </span>{" "}
                Đã bán
              </div>
            </div>
            <div className="bg-base-200/50 p-4 mb-6">
              <div className="text-3xl font-medium text-primary">
                ₫{product.price?.toLocaleString("vi-VN")}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-base-content/70 mb-5">
              <span className="w-24">Vận chuyển</span>
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.909.53l4.158 8.315A1 1 0 0119.748 17H19m-4-1v-1m-4 1v-1"
                  />
                </svg>
                Xử lý đơn hàng bởi Shopee
              </span>
            </div>

            {/* BỘ CHỌN SỐ LƯỢNG */}
            <div className="flex items-center gap-4 text-sm text-base-content/70 mb-8">
              <span className="w-24">Số lượng</span>
              <div className="flex items-center border border-base-300 rounded-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-1.5 hover:bg-base-200 border-r border-base-300 transition-colors"
                >
                  -
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="w-14 text-center outline-none text-base-content font-medium bg-transparent"
                />
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stockQuantity, q + 1))
                  }
                  className="px-4 py-1.5 hover:bg-base-200 border-l border-base-300 transition-colors"
                >
                  +
                </button>
              </div>
              <span>{product.stockQuantity} sản phẩm có sẵn</span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="btn btn-outline border-primary text-primary hover:bg-primary/5 hover:border-primary hover:text-primary w-52 bg-primary/10 rounded-sm font-normal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Thêm Vào Giỏ Hàng
              </button>
              <button
                onClick={handleBuyNow}
                className="btn btn-primary text-white w-32 rounded-sm font-normal"
              >
                Mua Ngay
              </button>
            </div>
          </div>
        </div>

        {/* KHỐI 2: THÔNG TIN SHOP */}
        {shop && (
          <div className="bg-white p-6 rounded-sm shadow-[0_1px_1px_0_rgba(0,0,0,0.05)] mb-4 flex justify-between items-center">
            <div className="flex items-center gap-5 pr-6 border-r border-base-200 min-w-[350px]">
              <div className="w-20 h-20 rounded-full border border-base-200 overflow-hidden bg-base-100 shrink-0">
                <img
                  src={
                    shop.logoUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name)}&background=random`
                  }
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-medium m-0">{shop.name}</h3>
                <div className="text-success text-xs mb-3">
                  ● Đang hoạt động
                </div>
                <div className="flex gap-2">
                  <button className="bg-primary/10 text-primary border border-primary px-3 py-1.5 text-sm rounded-sm flex items-center gap-1 hover:bg-primary/20 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Chat ngay
                  </button>
                  <Link
                    to={`/shop/${shop.id}`}
                    className="bg-white text-base-content border border-base-300 px-3 py-1.5 text-sm rounded-sm flex items-center gap-1 hover:bg-base-50 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Xem Shop
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex-1 pl-6 grid grid-cols-3 gap-y-3 text-sm text-base-content/70">
              <div>
                Đánh giá:{" "}
                <span className="text-primary">{shop.rating || "0.0"}</span>
              </div>
              <div>
                Tỉ lệ phản hồi: <span className="text-primary">95%</span>
              </div>
              <div>
                Tham gia: <span className="text-primary">12 tháng trước</span>
              </div>
              <div>
                Sản phẩm: <span className="text-primary">{shopProductCount}</span>
              </div>
              <div>
                Thời gian phản hồi:{" "}
                <span className="text-primary">vài giờ</span>
              </div>
              <div>
                Người theo dõi: <span className="text-primary">1,5k</span>
              </div>
            </div>
          </div>
        )}

        {/* KHỐI 3: CHI TIẾT SẢN PHẨM & BREADCRUMBS ĐỘNG */}
        <div className="bg-white p-6 rounded-sm shadow-[0_1px_1px_0_rgba(0,0,0,0.05)] mb-4">
          <h2 className="text-lg font-medium bg-base-200/50 p-3 mb-5 m-0 uppercase">
            Chi tiết sản phẩm
          </h2>
          <div className="space-y-4 text-sm pl-4">
            <div className="flex">
              <div className="w-36 text-base-content/60">Danh mục</div>
              <div className="flex items-center flex-wrap gap-2 text-blue-600">
                <Link to="/" className="hover:underline">
                  Shopee
                </Link>
                {breadcrumbs.map((crumb) => (
                  <span key={crumb.id} className="flex items-center gap-2">
                    <span className="text-base-content/50">{">"}</span>
                    <Link
                      to={`/category/${crumb.id}`}
                      className="hover:underline"
                    >
                      {crumb.name}
                    </Link>
                  </span>
                ))}
                <span className="flex items-center gap-2">
                  <span className="text-base-content/50">{">"}</span>
                  <span className="text-base-content">
                    {currentCategoryName}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex">
              <div className="w-36 text-base-content/60">Kho</div>
              <div>{product.stockQuantity}</div>
            </div>
            <div className="flex">
              <div className="w-36 text-base-content/60">Gửi từ</div>
              <div>Hà Nội</div>
            </div>
          </div>

          <h2 className="text-lg font-medium bg-base-200/50 p-3 mt-8 mb-5 m-0 uppercase">
            Mô tả sản phẩm
          </h2>
          <div className="pl-4 text-sm leading-relaxed whitespace-pre-wrap text-base-content/80">
            {product.description || "Chưa có mô tả cho sản phẩm này."}
          </div>
        </div>

        {/* KHỐI 4: ĐÁNH GIÁ SẢN PHẨM VỚI FILTER */}
        <div className="bg-white p-6 rounded-sm shadow-[0_1px_1px_0_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-medium m-0 uppercase mb-4">
            Đánh giá sản phẩm
          </h2>

          <div className="flex items-center gap-8 bg-warning/5 border border-warning/20 p-6 mb-6 rounded-sm">
            <div className="text-center min-w-[120px]">
              <div className="text-3xl text-warning font-bold">
                {product.averageRating || "0.0"}
                <span className="text-xl font-normal">/5</span>
              </div>
              <div className="text-warning text-lg">
                {"★".repeat(Math.round(product.averageRating || 0))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 flex-1">
              <button
                onClick={() => handleFilterChange("all")}
                className={`px-4 py-1.5 border rounded-sm text-sm ${filterRating === "all" ? "border-primary text-primary bg-primary/5" : "border-base-300 bg-white"}`}
              >
                Tất cả
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => handleFilterChange(star)}
                  className={`px-4 py-1.5 border rounded-sm text-sm ${filterRating === star ? "border-primary text-primary bg-primary/5" : "border-base-300 bg-white"}`}
                >
                  {star} Sao
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-0 min-h-[200px]">
            {reviews.length === 0 ? (
              <div className="text-center py-10 text-base-content/50">
                Không có đánh giá nào phù hợp.
              </div>
            ) : (
              reviews.map((review, idx) => (
                <div
                  key={review.orderId || idx}
                  className="flex gap-4 border-b border-base-200 py-4 last:border-0"
                >
                  <div className="w-10 h-10 rounded-full bg-base-200 overflow-hidden shrink-0 border border-base-300">
                    <img
                      src={
                        review.buyerAvatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(review.buyerName || "U")}&background=random`
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">
                      {review.buyerName || "Người dùng ẩn danh"}
                    </div>
                    <div className="text-warning text-[10px] my-1">
                      {"★".repeat(review.rating)}
                    </div>
                    <div className="text-sm mt-2 text-base-content/90">
                      {review.comment}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Phân trang cho Review */}
          {reviewTotalPages > 1 && (
            <div className="flex justify-end mt-6">
              <div className="join">
                <button
                  disabled={reviewPage === 1}
                  onClick={() => loadReviews(reviewPage - 1)}
                  className="join-item btn btn-sm btn-outline border-base-300"
                >
                  «
                </button>
                <button className="join-item btn btn-sm bg-base-100 border-base-300 hover:bg-base-100">
                  Trang {reviewPage} / {reviewTotalPages}
                </button>
                <button
                  disabled={reviewPage === reviewTotalPages}
                  onClick={() => loadReviews(reviewPage + 1)}
                  className="join-item btn btn-sm btn-outline border-base-300"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}