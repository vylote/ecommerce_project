import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../shared/components/Navbar';
import api from '../../shared/utils/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  
  const [product, setProduct] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]); // State lưu chuỗi danh mục
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [filterRating, setFilterRating] = useState('all'); // 'all' hoặc 1, 2, 3, 4, 5

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Chi tiết SP và Đánh giá ban đầu (Trang 1, không lọc rating)
        const [productRes, reviewRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/reviews`, { params: { page: 1, size: 5 } })
        ]);

        const prodData = productRes.data.result;
        setProduct(prodData);
        setReviews(reviewRes.data.result.data);
        setReviewTotalPages(reviewRes.data.result.totalPages);

        // 2. Fetch Breadcrumbs dựa vào categoryId của sản phẩm
        if (prodData.category?.id) {
          const categoryRes = await api.get(`/categories/${prodData.category.id}`);
          // Giả sử backend trả về breadcrumbs (danh sách các danh mục cha)
          setBreadcrumbs(categoryRes.data.result.breadcrumbs || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  // Hàm load reviews, có nhận tham số page và rating để lọc
  const loadReviews = async (pageToLoad, ratingToFilter = filterRating) => {
    try {
      const params = { page: pageToLoad, size: 5 };
      if (ratingToFilter !== 'all') {
        params.rating = ratingToFilter; // Gắn thêm param rating gọi xuống Backend
      }

      const res = await api.get(`/products/${id}/reviews`, { params });
      setReviews(res.data.result.data);
      setReviewPage(pageToLoad);
      setReviewTotalPages(res.data.result.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  // Hàm xử lý khi user bấm vào các nút lọc sao (Tất cả, 5 Sao, 4 Sao...)
  const handleFilterChange = (rating) => {
    setFilterRating(rating); // Đổi màu nút được bấm
    loadReviews(1, rating);  // Lấy dữ liệu mới, bắt đầu từ trang 1
  };

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

  if (!product) return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;

  const shop = product.shop;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-10">
      <Navbar />

      <div className="max-w-[1200px] mx-auto mt-5">
        
        {/* KHỐI 1: KHUNG ẢNH VÀ THÔNG TIN CƠ BẢN */}
        <div className="bg-white p-4 rounded-sm shadow-[0_1px_1px_0_rgba(0,0,0,0.05)] mb-4 flex gap-6">
          <div className="w-[400px] h-[400px] bg-base-200 shrink-0">
             {product.images && product.images.length > 0 ? (
                <img src={product.images.find(i => i.isPrimary)?.url || product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📦</div>
             )}
          </div>
          <div className="flex-1 py-2">
             <h1 className="text-xl font-medium mb-3">{product.name}</h1>
             <div className="flex items-center text-sm gap-4 mb-4 text-base-content/70">
                <div className="flex items-center text-warning font-medium border-b border-warning">
                   <span className="mr-1">{product.averageRating || "0.0"}</span> ★
                </div>
                <div className="w-px h-4 bg-base-300"></div>
                <div>{product.reviewCount || 0} Đánh giá</div>
                <div className="w-px h-4 bg-base-300"></div>
                <div>{product.soldCount || 0} Đã bán</div>
             </div>
             <div className="bg-base-200/50 p-4 mb-6">
                <div className="text-3xl font-medium text-primary">₫{product.price?.toLocaleString('vi-VN')}</div>
             </div>
             <div className="flex items-center gap-4 text-sm text-base-content/70">
                <span className="w-24">Kho hàng</span>
                <span>{product.stockQuantity}</span>
             </div>
          </div>
        </div>

        {/* KHỐI 2: THÔNG TIN SHOP */}
        {shop && (
          <div className="bg-white p-6 rounded-sm shadow-[0_1px_1px_0_rgba(0,0,0,0.05)] mb-4 flex justify-between items-center">
            <div className="flex items-center gap-5 pr-6 border-r border-base-200 min-w-[350px]">
              <div className="w-20 h-20 rounded-full border border-base-200 overflow-hidden bg-base-100 shrink-0">
                <img 
                  src={shop.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name)}&background=random`} 
                  alt={shop.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-medium m-0">{shop.name}</h3>
                <div className="text-success text-xs mb-3">● Đang hoạt động</div>
                <div className="flex gap-2">
                  <button className="bg-primary/10 text-primary border border-primary px-3 py-1.5 text-sm rounded-sm flex items-center gap-1 hover:bg-primary/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Chat ngay
                  </button>
                  <Link to={`/shop/${shop.id}`} className="bg-white text-base-content border border-base-300 px-3 py-1.5 text-sm rounded-sm flex items-center gap-1 hover:bg-base-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Xem Shop
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="flex-1 pl-6 grid grid-cols-3 gap-y-3 text-sm text-base-content/70">
              <div>Đánh giá: <span className="text-primary">{shop.rating || "0.0"}</span></div>
              <div>Tỉ lệ phản hồi: <span className="text-primary">95%</span></div>
              <div>Tham gia: <span className="text-primary">12 tháng trước</span></div>
              <div>Sản phẩm: <span className="text-primary">94</span></div>
              <div>Thời gian phản hồi: <span className="text-primary">vài giờ</span></div>
              <div>Người theo dõi: <span className="text-primary">1,5k</span></div>
            </div>
          </div>
        )}

        {/* KHỐI 3: CHI TIẾT SẢN PHẨM & BREADCRUMBS ĐỘNG */}
        <div className="bg-white p-6 rounded-sm shadow-[0_1px_1px_0_rgba(0,0,0,0.05)] mb-4">
          <h2 className="text-lg font-medium bg-base-200/50 p-3 mb-5 m-0 uppercase">Chi tiết sản phẩm</h2>
          <div className="space-y-4 text-sm pl-4">
            <div className="flex">
              <div className="w-36 text-base-content/60">Danh mục</div>
              <div className="flex items-center flex-wrap gap-2 text-blue-600">
                <Link to="/" className="hover:underline">Shopee</Link>
                
                {/* Lặp qua danh sách breadcrumbs từ Backend */}
                {breadcrumbs.map((crumb) => (
                  <span key={crumb.id} className="flex items-center gap-2">
                    <span className="text-base-content/50">{'>'}</span>
                    <Link to={`/category/${crumb.id}`} className="hover:underline">{crumb.name}</Link>
                  </span>
                ))}
                
                {/* Cuối cùng là tên danh mục hiện tại của sản phẩm */}
                <span className="flex items-center gap-2">
                  <span className="text-base-content/50">{'>'}</span>
                  <span className="text-base-content">{product.category?.name || "Khác"}</span>
                </span>
              </div>
            </div>
            <div className="flex"><div className="w-36 text-base-content/60">Kho</div><div>{product.stockQuantity}</div></div>
            <div className="flex"><div className="w-36 text-base-content/60">Gửi từ</div><div>Hà Nội</div></div>
          </div>

          <h2 className="text-lg font-medium bg-base-200/50 p-3 mt-8 mb-5 m-0 uppercase">Mô tả sản phẩm</h2>
          <div className="pl-4 text-sm leading-relaxed whitespace-pre-wrap text-base-content/80">
            {product.description || "Chưa có mô tả cho sản phẩm này."}
          </div>
        </div>

        {/* KHỐI 4: ĐÁNH GIÁ SẢN PHẨM VỚI FILTER */}
        <div className="bg-white p-6 rounded-sm shadow-[0_1px_1px_0_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-medium m-0 uppercase mb-4">Đánh giá sản phẩm</h2>
          
          <div className="flex items-center gap-8 bg-warning/5 border border-warning/20 p-6 mb-6 rounded-sm">
            <div className="text-center min-w-[120px]">
              <div className="text-3xl text-warning font-bold">{product.averageRating || "0.0"}<span className="text-xl font-normal">/5</span></div>
              <div className="text-warning text-lg">{'★'.repeat(Math.round(product.averageRating || 0))}</div>
            </div>
            
            <div className="flex flex-wrap gap-3 flex-1">
              <button 
                onClick={() => handleFilterChange('all')} 
                className={`px-4 py-1.5 border rounded-sm text-sm ${filterRating === 'all' ? 'border-primary text-primary bg-primary/5' : 'border-base-300 bg-white'}`}
              >
                Tất cả
              </button>
              {[5, 4, 3, 2, 1].map(star => (
                <button 
                  key={star} 
                  onClick={() => handleFilterChange(star)} 
                  className={`px-4 py-1.5 border rounded-sm text-sm ${filterRating === star ? 'border-primary text-primary bg-primary/5' : 'border-base-300 bg-white'}`}
                >
                  {star} Sao
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-0 min-h-[200px]">
            {reviews.length === 0 ? (
              <div className="text-center py-10 text-base-content/50">Không có đánh giá nào phù hợp.</div>
            ) : (
              reviews.map((review, idx) => (
                <div key={review.orderId || idx} className="flex gap-4 border-b border-base-200 py-4 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-base-200 overflow-hidden shrink-0 border border-base-300">
                    <img 
                      src={review.buyerAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.buyerName || 'U')}&background=random`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{review.buyerName || "Người dùng ẩn danh"}</div>
                    <div className="text-warning text-[10px] my-1">{'★'.repeat(review.rating)}</div>
                    <div className="text-sm mt-2 text-base-content/90">{review.comment}</div>
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
                >«</button>
                <button className="join-item btn btn-sm bg-base-100 border-base-300 hover:bg-base-100">
                  Trang {reviewPage} / {reviewTotalPages}
                </button>
                <button 
                  disabled={reviewPage === reviewTotalPages} 
                  onClick={() => loadReviews(reviewPage + 1)} 
                  className="join-item btn btn-sm btn-outline border-base-300"
                >»</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}