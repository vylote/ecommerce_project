import { useState, useEffect } from 'react';
import Navbar from '../../shared/components/Navbar'; // Đảm bảo đường dẫn import Navbar chính xác
import api from '../../shared/utils/api';

export default function DailyDiscovery() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/products', {
          params: {
            page: page,
            size: 48, // 8 hàng x 6 cột = 48 sản phẩm
            sortBy: 'createdAt',
            order: 'desc'
          }
        });
        
        const pageResponse = response.data.result;
        setProducts(pageResponse.data);
        setPageInfo({
          currentPage: pageResponse.currentPage,
          totalPages: pageResponse.totalPages,
        });
        // Cuộn lên đầu trang mỗi khi chuyển trang mượt mà
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]); // Chạy lại mỗi khi state 'page' thay đổi

  const getDisplayImage = (product) => {
    if (!product.images || product.images.length === 0) return null;
    const primaryImg = product.images.find(img => img.isPrimary);
    return primaryImg ? primaryImg.url : product.images[0].url;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pageInfo.totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-base-100 p-4 rounded-xl border border-base-300 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-neutral uppercase tracking-wider">
            Khám Phá Hàng Ngày
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 48 }).map((_, idx) => (
              <div key={idx} className="card bg-base-100 rounded-xl border border-base-300 shadow-sm p-3">
                <div className="skeleton aspect-square w-full mb-3 rounded-lg"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-4 w-2/3 mb-4"></div>
                <div className="skeleton h-5 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.map((product) => {
                const displayImageUrl = getDisplayImage(product);
                
                return (
                  <div 
                    key={product.id} 
                    className="card bg-base-100 rounded-xl border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all overflow-hidden group cursor-pointer flex flex-col"
                  >
                    <figure className="relative aspect-square bg-base-200 overflow-hidden shrink-0">
                      {displayImageUrl ? (
                        <img 
                          src={displayImageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-base-content/20 bg-base-200">
                          <span className="text-4xl opacity-50">📦</span>
                        </div>
                      )}
                    </figure>
                    
                    <div className="card-body p-3 flex flex-col justify-between flex-1 gap-2">
                      <h4 className="text-sm font-medium text-base-content line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                      
                      <div className="space-y-1.5 mt-auto">
                        <div className="text-primary font-bold text-base">
                          {product.price ? product.price.toLocaleString('vi-VN') : 0} ₫
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-warning text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{product.averageRating ? Number(product.averageRating).toFixed(1) : "0.0"}</span>
                          </div>
                          <div className="text-xs text-base-content/50">
                            Đã bán {product.soldCount || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination UI */}
            {pageInfo.totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <div className="join border border-base-300 shadow-sm">
                  <button 
                    className="join-item btn btn-outline"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    «
                  </button>
                  <button className="join-item btn bg-base-100 no-animation">
                    Trang {page} / {pageInfo.totalPages}
                  </button>
                  <button 
                    className="join-item btn btn-outline"
                    disabled={page === pageInfo.totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}