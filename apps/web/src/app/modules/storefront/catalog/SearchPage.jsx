import CatalogFilters from "./components/CatalogFilters";
import CatalogProductList from "./components/CatalogProductList";
import useCatalogQuery from "./useCatalogQuery";
import getDisplayImage from "../../../entities/product/getDisplayImage";
import ProductImage from "../../../shared/components/ProductImage";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../shared/components/Navbar";
import api from "../../../config/api";

export default function SearchPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 1 });

  const [shopResult, setShopResult] = useState(null);
  const [shopProducts, setShopProducts] = useState([]);


  const query = useCatalogQuery("relevance");
  const { keyword, page, sortBy, order, minPrice, maxPrice, minRating } = query;

  useEffect(() => {
    const fetchData = async () => {
      if (!keyword) return;
      setLoading(true);
      try {
        api
          .get("/shops/search", { params: { keyword, size: 1 } })
          .then(async (res) => {
            const shopList = Array.isArray(res.data.result)
              ? res.data.result
              : res.data.result?.data;
            const shopData = shopList?.[0];
            if (shopData) {
              setShopResult(shopData);
              const pRes = await api.get("/products", {
                params: {
                  shopId: shopData.id,
                  size: 4,
                  sortBy: "soldCount",
                  order: "desc",
                },
              });
              setShopProducts(pRes.data.result.data || []);
            } else {
              setShopResult(null);
              setShopProducts([]);
            }
          })
          .catch(() => setShopResult(null));

        const params = {
          keyword,
          page,
          size: 25,
          sortBy: sortBy === "relevance" ? "id" : sortBy,
          order,
        };
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (minRating) params.minRating = minRating;

        const prodRes = await api.get("/products", { params });
        setProducts(prodRes.data.result.data);
        setPageInfo({
          currentPage: prodRes.data.result.currentPage,
          totalPages: prodRes.data.result.totalPages,
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [keyword, page, sortBy, order, minPrice, maxPrice, minRating]);


  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      <div className="max-w-[1200px] mx-auto flex py-5 gap-6">
        <aside className="w-[220px] shrink-0 bg-transparent">
          <div className="mb-6">
            <h3 className="font-bold text-sm uppercase mb-3 flex items-center gap-2">
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Bộ Lọc Tìm Kiếm
            </h3>

            <CatalogFilters query={query} />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="text-base mb-4 text-base-content/80">
            Kết quả tìm kiếm cho từ khoá '
            <span className="font-bold text-primary">{keyword}</span>'
          </div>

          {shopResult && (
            <div className="bg-base-100 p-4 rounded-sm border border-base-200 mb-5 shadow-[0_1px_1px_0_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-4 border-b border-base-200 pb-3">
                <div className="flex items-center gap-4">
                  <div className="avatar">
                    <div className="w-14 h-14 rounded-full border border-base-300 overflow-hidden bg-base-200">
                      {shopResult.logoUrl ? (
                        <img
                          src={shopResult.logoUrl}
                          alt={shopResult.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-xl opacity-30">
                          🏪
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-1">
                      {shopResult.name}
                    </h4>
                    <div className="flex items-center text-xs text-base-content/70 gap-2">
                      <span className="flex items-center text-warning font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 mr-1 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {shopResult.rating
                          ? shopResult.rating.toFixed(1)
                          : "0.0"}
                      </span>
                      <span className="text-base-300">|</span>
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">
                        Gian hàng
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/shop/${shopResult.id}`}
                  className="btn btn-outline btn-sm text-xs font-normal border-base-300 hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  Xem thêm Shop{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {shopProducts.map((p) => {
                  const img = getDisplayImage(p);
                  return (
                    <Link
                      to={`/product/${p.id}`}
                      key={p.id}
                      className="border border-base-200 rounded-sm hover:border-primary transition-colors block overflow-hidden group"
                    >
                      <div className="aspect-square bg-base-200 w-full relative">
                        <ProductImage
                            src={img}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                      </div>
                      <div className="p-2">
                        <div className="text-primary font-medium text-sm">
                          ₫{p.price?.toLocaleString("vi-VN")}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <CatalogProductList
            defaultSort="relevance"
            defaultLabel="Liên Quan"
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
