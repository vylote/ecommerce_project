import DiscoveryProductGrid from "../../product/components/DiscoveryProductGrid";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../shared/utils/api";
import { useI18n } from "../../../shared/i18n";

export default function ProductSection() {
  const { t } = useI18n();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products", {
          params: {
            page: 1,
            size: 12,
            sortBy: "random",
            order: "desc",
          },
        });

        const pageResponse = response?.data?.result;

        setProducts(pageResponse?.data || []);

        setPageInfo({
          currentPage: pageResponse?.currentPage || 1,
          totalPages: pageResponse?.totalPages || 1,
        });
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  return (
    <div className="space-y-4">
      <div className="bg-base-100 p-4 rounded-xl border border-base-300 shadow-sm flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral uppercase tracking-wider">
          {t("home.daily_discovery")}
        </h3>
      </div>

      <DiscoveryProductGrid products={products} loading={loading} />
      {pageInfo.currentPage < pageInfo.totalPages && (
        <div className="flex justify-center pt-4">
          <Link
            to="/daily-discovery"
            className="btn btn-outline btn-primary px-8"
          >
            {t("home.view_more")}
          </Link>
        </div>
      )}
    </div>
  );
}
