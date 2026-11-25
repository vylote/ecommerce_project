import DiscoveryProductGrid from "../../../entities/product/components/DiscoveryProductGrid";
import { useState, useEffect } from 'react';
import Navbar from '../../../shared/components/Navbar';
import api from '../../../config/api';
import { useI18n } from '../../../../i18n';

export default function DailyDiscovery() {
  const { t } = useI18n();
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
            size: 48,
            sortBy: 'random',
            order: 'desc'
          }
        });
        
        const pageResponse = response.data.result;
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

    void fetchProducts();
  }, [page]);

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
            {t("home.daily_discovery_title")}
          </h2>
        </div>

        {loading ? (
          <DiscoveryProductGrid loading placeholderCount={48} />
        ) : (
          <>
            <DiscoveryProductGrid products={products} showPriceRange />
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
                    {t("order.page")} {page} / {pageInfo.totalPages}
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