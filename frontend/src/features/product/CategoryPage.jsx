import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../shared/components/Navbar';
import api from '../../shared/utils/api';

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 1 });
  
  // States cho Sidebar
  const [currentCategory, setCurrentCategory] = useState(null);
  const [childCategories, setChildCategories] = useState([]);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreBrands, setShowMoreBrands] = useState(false); // Sẽ làm sau khi có API Brand

  // States cục bộ cho form nhập giá
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');

  // Đọc các tham số từ URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sortBy') || 'soldCount';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const minRating = searchParams.get('minRating');

  // Khởi tạo dữ liệu trang
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch thông tin danh mục hiện tại & danh mục con
        const [catRes, childRes] = await Promise.all([
          api.get(`/categories/${id}`),
          api.get(`/categories/${id}/childrens`).catch(() => ({ data: { result: [] } })) // Bỏ qua nếu lỗi
        ]);
        setCurrentCategory(catRes.data.result);
        setChildCategories(childRes.data.result);

        // 2. Fetch danh sách sản phẩm theo filter
        const params = {
          categoryId: id,
          page: page,
          size: 25,
          sortBy: sortBy,
          order: 'desc'
        };
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (minRating) params.minRating = minRating;

        const prodRes = await api.get('/products', { params });
        const pageResponse = prodRes.data.result;
        
        setProducts(pageResponse.data);
        setPageInfo({
          currentPage: pageResponse.currentPage,
          totalPages: pageResponse.totalPages,
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, page, sortBy, minPrice, maxPrice, minRating]);

  // Handlers cập nhật URL Params
  const updateParams = (newParams) => {
    const current = Object.fromEntries([...searchParams]);
    // Merge params mới vào, nếu value null/undefined thì xóa param đó
    const updated = { ...current, ...newParams };
    Object.keys(updated).forEach(key => {
      if (updated[key] === null || updated[key] === undefined || updated[key] === '') {
        delete updated[key];
      }
    });
    setSearchParams(updated);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pageInfo.totalPages) updateParams({ page: newPage });
  };

  const handleSort = (type) => updateParams({ sortBy: type, page: 1 });

  const applyPriceFilter = () => {
    updateParams({
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
      page: 1
    });
  };

  const applyRatingFilter = (rating) => {
    updateParams({ minRating: rating, page: 1 });
  };

  const getDisplayImage = (product) => {
    if (!product.images || product.images.length === 0) return null;
    const primaryImg = product.images.find(img => img.isPrimary);
    return primaryImg ? primaryImg.url : product.images[0].url;
  };

  // Giới hạn danh mục hiển thị
  const displayedCategories = showMoreCategories ? childCategories : childCategories.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto flex py-5">
        <aside className="w-[250px] shrink-0 bg-transparent pr-4">
          <div className="mb-6">
            <h3 className="font-bold text-sm uppercase mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              {currentCategory ? currentCategory.name : 'Danh Mục'}
            </h3>
            {childCategories.length > 0 && (
              <ul className="text-sm space-y-2 pl-6">
                <li className="font-bold text-primary cursor-pointer mb-2">Tất cả</li>
                {displayedCategories.map(child => (
                  <li 
                    key={child.id}
                    className="cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/category/${child.id}`)}
                  >
                    {child.name}
                  </li>
                ))}
                
                {childCategories.length > 4 && (
                  <li 
                    className="cursor-pointer text-primary font-medium mt-1 flex items-center gap-1"
                    onClick={() => setShowMoreCategories(!showMoreCategories)}
                  >
                    {showMoreCategories ? 'Thu gọn' : 'Thêm...'}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${showMoreCategories ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </li>
                )}
              </ul>
            )}
          </div>

          <div className="border-t border-base-300 pt-4 mb-6">
            <h3 className="font-bold text-sm uppercase mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Bộ Lọc Tìm Kiếm
            </h3>
            
            {/* Brands Filter (Sẽ kết nối API sau) */}
            <div className="mb-5">
              <h4 className="text-sm font-medium mb-2">Thương hiệu</h4>
              <div className="space-y-2 text-sm text-base-content/50 italic">
                (Chưa có dữ liệu thương hiệu)
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-5">
              <h4 className="text-sm font-medium mb-2">Khoảng Giá</h4>
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="number" 
                  placeholder="₫ TỪ" 
                  className="input input-bordered input-sm w-full max-w-[90px] px-2"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                />
                <span className="text-base-300">-</span>
                <input 
                  type="number" 
                  placeholder="₫ ĐẾN" 
                  className="input input-bordered input-sm w-full max-w-[90px] px-2"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                />
              </div>
              <button 
                className="btn btn-primary btn-sm w-full text-white"
                onClick={applyPriceFilter}
              >
                Áp dụng
              </button>
            </div>

            {/* Rating Filter */}
            <div className="mb-5">
              <h4 className="text-sm font-medium mb-2">Đánh Giá</h4>
              <div className="space-y-2 text-sm">
                {[5, 4, 3].map((star) => (
                  <label key={star} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="rating" 
                      className="radio radio-xs radio-primary" 
                      checked={Number(minRating) === star}
                      onChange={() => applyRatingFilter(star)}
                    /> 
                    <div className="flex text-warning text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < star ? "text-warning" : "text-base-300"}>★</span>
                      ))}
                      {star < 5 && <span className="text-base-content ml-1">trở lên</span>}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-base-200/50 p-3 rounded-sm flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-base-content/70 mr-2">Sắp xếp theo</span>
              <button 
                className={`btn btn-sm ${sortBy === 'soldCount' ? 'btn-primary text-white' : 'bg-base-100 border-transparent font-normal'}`}
                onClick={() => handleSort('soldCount')}
              >
                Phổ Biến
              </button>
              <button 
                className={`btn btn-sm ${sortBy === 'createdAt' ? 'btn-primary text-white' : 'bg-base-100 border-transparent font-normal'}`}
                onClick={() => handleSort('createdAt')}
              >
                Mới Nhất
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-primary">{pageInfo.currentPage}</span> / {pageInfo.totalPages}
              </div>
              <div className="join">
                <button 
                  className="join-item btn btn-sm btn-outline bg-base-100 border-base-300 px-3"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button 
                  className="join-item btn btn-sm btn-outline bg-base-100 border-base-300 px-3"
                  disabled={page === pageInfo.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-5 gap-2.5">
              {Array.from({ length: 25 }).map((_, idx) => (
                <div key={idx} className="bg-base-100 p-2 border border-base-200">
                  <div className="skeleton aspect-square w-full mb-2 rounded-sm"></div>
                  <div className="skeleton h-3 w-full mb-2"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-base-100 py-16 text-center text-base-content/50">
              <div className="text-4xl mb-4">🔍</div>
              <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-2.5">
                {products.map((product) => {
                  const displayImageUrl = getDisplayImage(product);
                  return (
                    <Link 
                      to={`/product/${product.id}`}
                      key={product.id} 
                      className="bg-base-100 border border-transparent hover:border-primary shadow-[0_1px_1px_0_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-[1px] transition-all flex flex-col group relative pb-2"
                    >
                      <figure className="relative aspect-square bg-base-200 w-full overflow-hidden shrink-0">
                        {displayImageUrl ? (
                          <img 
                            src={displayImageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-base-content/20 bg-base-200">
                            <span className="text-3xl opacity-50">📦</span>
                          </div>
                        )}
                      </figure>
                      
                      <div className="p-2 flex flex-col flex-1">
                        <h4 className="text-xs text-base-content line-clamp-2 min-h-[2.5rem] leading-[1.25rem]">
                          {product.name}
                        </h4>
                        
                        <div className="mt-auto pt-2">
                          <div className="text-primary font-medium text-sm mb-1">
                            ₫{product.price ? product.price.toLocaleString('vi-VN') : 0}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-warning text-[10px]">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>{product.averageRating || product.rating || "0.0"}</span>
                            </div>
                            <span className="text-[10px] text-base-content/60">
                              Đã bán {product.soldCount >= 1000 ? (product.soldCount / 1000).toFixed(1) + 'k' : product.soldCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {pageInfo.totalPages > 1 && (
                <div className="flex justify-center mt-10 mb-8">
                  <div className="join gap-2">
                    <button 
                      className="join-item btn btn-sm bg-transparent border-none text-base-content/60 hover:text-primary hover:bg-transparent"
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    
                    {Array.from({ length: pageInfo.totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`join-item btn btn-sm border-none w-8 h-8 rounded-sm font-medium text-sm ${page === pageNum ? 'bg-primary text-white hover:bg-primary' : 'bg-transparent text-base-content/70 hover:text-primary hover:bg-transparent'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button 
                      className="join-item btn btn-sm bg-transparent border-none text-base-content/60 hover:text-primary hover:bg-transparent"
                      disabled={page === pageInfo.totalPages}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}