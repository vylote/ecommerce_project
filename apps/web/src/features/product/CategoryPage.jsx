import CatalogProductCard from "./components/CatalogProductCard";
import PriceRangeFilter from "./components/PriceRangeFilter";
import RatingFilter from "./components/RatingFilter";
import PriceSortSelect from "./components/PriceSortSelect";
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../shared/components/Navbar';
import api from '../../shared/utils/api';

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 1 });
  
  const [currentCategory, setCurrentCategory] = useState(null);
  const [childCategories, setChildCategories] = useState([]);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreBrands, setShowMoreBrands] = useState(false);


  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sortBy') || 'soldCount';
  const order = searchParams.get('order') || 'desc';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const minRating = searchParams.get('minRating');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, childRes] = await Promise.all([
          api.get(`/categories/${id}`),
          api.get(`/categories/${id}/childrens`).catch(() => ({ data: { result: [] } }))
        ]);
        let categoryInfo = catRes.data.result;
        let childrenInfo = childRes.data.result;

        if (childrenInfo.length === 0 && categoryInfo.parentId) {
          try {
            const [parentCatRes, parentChildRes] = await Promise.all([
              api.get(`/categories/${categoryInfo.parentId}`),
              api.get(`/categories/${categoryInfo.parentId}/childrens`)
            ]);
            setCurrentCategory(parentCatRes.data.result);
            setChildCategories(parentChildRes.data.result);
          } catch (e) {
            console.error(e);
            setCurrentCategory(categoryInfo);
            setChildCategories(childrenInfo);
          }
        } else {
          setCurrentCategory(categoryInfo);
          setChildCategories(childrenInfo);
        }

        const params = {
          categoryId: id,
          page: page,
          size: 25,
          sortBy: sortBy,
          order: order
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
  }, [id, page, sortBy, order, minPrice, maxPrice, minRating]);

  const updateParams = (newParams) => {
    const current = Object.fromEntries([...searchParams]);
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

  const handleSort = (type, sortOrder = 'desc') => {
    updateParams({ sortBy: type, order: sortOrder, page: 1 });
  };


  const applyRatingFilter = (rating) => {
    updateParams({ minRating: rating, page: 1 });
  };

  const displayedCategories = showMoreCategories ? childCategories : childCategories.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto flex py-5 gap-6">
        <aside className="w-[220px] shrink-0 bg-transparent">
          <div className="mb-6">
            <h3 className="font-bold text-sm uppercase mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              Danh Mục
            </h3>
            
            {currentCategory?.breadcrumbs?.length > 0 && (
              <div className="text-sm mb-2">
                {currentCategory.breadcrumbs.map((crumb, idx) => (
                  <div 
                    key={crumb.id} 
                    className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors font-medium text-base-content/70 mb-2"
                    style={{ paddingLeft: `${idx * 12}px` }}
                    onClick={() => navigate(`/category/${crumb.id}`)}
                  >
                    {idx > 0 && <span className="text-xs text-base-300">↳</span>}
                    {crumb.name}
                  </div>
                ))}
              </div>
            )}
            
            {currentCategory && (
              <div 
                className={`text-sm flex items-center gap-1.5 cursor-pointer transition-colors mb-2 ${Number(id) === currentCategory.id ? 'font-bold text-primary' : 'hover:text-primary font-medium text-base-content/80'}`}
                style={{ paddingLeft: `${(currentCategory.breadcrumbs?.length || 0) * 12}px` }}
                onClick={() => navigate(`/category/${currentCategory.id}`)}
              >
                {currentCategory.breadcrumbs?.length > 0 && <span className="text-xs text-base-300">↳</span>}
                {currentCategory.name}
              </div>
            )}

            {childCategories.length > 0 && (
              <ul className="text-sm space-y-2" style={{ paddingLeft: `${((currentCategory?.breadcrumbs?.length || 0) + 1) * 12 + 4}px` }}>
                <li 
                  className={`cursor-pointer transition-colors ${Number(id) === currentCategory?.id ? 'font-bold text-primary' : 'hover:text-primary'}`}
                  onClick={() => currentCategory && navigate(`/category/${currentCategory.id}`)}
                >
                  Tất cả
                </li>
                {displayedCategories.map(child => (
                  <li 
                    key={child.id}
                    className={`cursor-pointer transition-colors ${Number(id) === child.id ? 'font-bold text-primary' : 'hover:text-primary'}`}
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
            
            <div className="mb-5">
              <h4 className="text-sm font-medium mb-2">Thương hiệu</h4>
              <div className="space-y-2 text-sm text-base-content/50 italic">
                (Chưa có dữ liệu)
              </div>
            </div>

            <PriceRangeFilter
              key={JSON.stringify([minPrice, maxPrice])}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onApply={(min, max) => updateParams({ minPrice: min, maxPrice: max, page: 1 })}
            />
            <RatingFilter minRating={minRating} onChange={applyRatingFilter} />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-base-200/50 p-3 rounded-sm flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 text-sm">
              <span className="text-base-content/70 mr-2">Sắp xếp theo</span>
              
              <button 
                className={`btn btn-sm ${sortBy === 'id' ? 'btn-primary text-white' : 'bg-base-100 border-transparent font-normal'}`}
                onClick={() => handleSort('id', 'desc')}
              >
                Phổ Biến
              </button>

              <button 
                className={`btn btn-sm ${sortBy === 'createdAt' ? 'btn-primary text-white' : 'bg-base-100 border-transparent font-normal'}`}
                onClick={() => handleSort('createdAt', 'desc')}
              >
                Mới Nhất
              </button>

              <button 
                className={`btn btn-sm ${sortBy === 'soldCount' ? 'btn-primary text-white' : 'bg-base-100 border-transparent font-normal'}`}
                onClick={() => handleSort('soldCount', 'desc')}
              >
                Bán Chạy
              </button>

              <PriceSortSelect active={sortBy === "price"} order={order} onChange={(value) => handleSort("price", value)} />
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
            <div className="bg-base-100 py-16 text-center text-base-content/50 shadow-sm border border-base-200">
              <div className="text-4xl mb-4">🔍</div>
              <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-2.5">
                {products.map((product) => (
                  <CatalogProductCard key={product.id} product={product} />
                ))}
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
