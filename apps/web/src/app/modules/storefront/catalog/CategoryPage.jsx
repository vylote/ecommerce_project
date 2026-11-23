import CatalogFilters from "./components/CatalogFilters";
import CatalogProductList from "./components/CatalogProductList";
import useCatalogQuery from "./useCatalogQuery";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import api from '../../../config/api';

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 1 });
  
  const [currentCategory, setCurrentCategory] = useState(null);
  const [childCategories, setChildCategories] = useState([]);
  const [showMoreCategories, setShowMoreCategories] = useState(false);

  const query = useCatalogQuery("soldCount");
  const { page, sortBy, order, minPrice, maxPrice, minRating } = query;

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

            <CatalogFilters query={query} />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <CatalogProductList
            defaultSort="id"
            defaultLabel="Phổ Biến"
            loading={loading}
            products={products}
            pageInfo={pageInfo}
            query={query}
          />
        </main>
      </div>
    </div>
  );
}
