import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../../shared/components/Navbar";
import api from "../../shared/utils/api";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 1 });

  const [shopResult, setShopResult] = useState(null);
  const [shopProducts, setShopProducts] = useState([]);

  const [minPriceInput, setMinPriceInput] = useState(
    searchParams.get("minPrice") || "",
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    searchParams.get("maxPrice") || "",
  );

  const keyword = searchParams.get("keyword") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = searchParams.get("sortBy") || "relevance";
  const order = searchParams.get("order") || "desc";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minRating = searchParams.get("minRating");

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

  const updateParams = (newParams) => {
    const current = Object.fromEntries([...searchParams]);
    const updated = { ...current, ...newParams };
    Object.keys(updated).forEach((key) => {
      if (
        updated[key] === null ||
        updated[key] === undefined ||
        updated[key] === ""
      ) {
        delete updated[key];
      }
    });
    setSearchParams(updated);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pageInfo.totalPages)
      updateParams({ page: newPage });
  };

  const handleSort = (type, sortOrder = "desc") => {
    updateParams({ sortBy: type, order: sortOrder, page: 1 });
  };

  const applyPriceFilter = () => {
    updateParams({ minPrice: minPriceInput, maxPrice: maxPriceInput, page: 1 });
  };

  const applyRatingFilter = (rating) => {
    updateParams({ minRating: rating, page: 1 });
  };

  const getDisplayImage = (product) => {
    if (!product?.images?.length) return null;
    const primaryImg = product.images.find((img) => img.isPrimary);
    return primaryImg ? primaryImg.url : product.images[0].url;
  };

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

            <div className="mb-5">
              <h4 className="text-sm font-medium mb-2">Đánh Giá</h4>
              <div className="space-y-2 text-sm">
                {[5, 4, 3].map((star) => (
                  <label
                    key={star}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="rating"
                      className="radio radio-xs radio-primary"
                      checked={Number(minRating) === star}
                      onChange={() => applyRatingFilter(star)}
                    />
                    <div className="flex text-warning text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < star ? "text-warning" : "text-base-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                      {star < 5 && (
                        <span className="text-base-content ml-1">trở lên</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
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
                        {img ? (
                          <img
                            src={img}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="opacity-30">📦</span>
                          </div>
                        )}
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

          <div className="bg-base-200/50 p-3 rounded-sm flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 text-sm">
              <span className="text-base-content/70 mr-2">Sắp xếp theo</span>

              <button
                className={`btn btn-sm ${sortBy === "relevance" ? "btn-primary text-white" : "bg-base-100 border-transparent font-normal"}`}
                onClick={() => handleSort("relevance", "desc")}
              >
                Liên Quan
              </button>

              <button
                className={`btn btn-sm ${sortBy === "createdAt" ? "btn-primary text-white" : "bg-base-100 border-transparent font-normal"}`}
                onClick={() => handleSort("createdAt", "desc")}
              >
                Mới Nhất
              </button>

              <button
                className={`btn btn-sm ${sortBy === "soldCount" ? "btn-primary text-white" : "bg-base-100 border-transparent font-normal"}`}
                onClick={() => handleSort("soldCount", "desc")}
              >
                Bán Chạy
              </button>

              <select
                className={`select select-sm outline-none focus:outline-none min-w-[160px] font-normal ${sortBy === "price" ? "bg-primary text-white border-primary" : "bg-base-100 border-transparent"}`}
                value={sortBy === "price" ? order : "default"}
                onChange={(e) => handleSort("price", e.target.value)}
              >
                <option
                  value="default"
                  disabled
                  className="bg-base-100 text-base-content"
                >
                  Giá
                </option>
                <option value="asc" className="bg-base-100 text-base-content">
                  Giá: Thấp đến Cao
                </option>
                <option value="desc" className="bg-base-100 text-base-content">
                  Giá: Cao đến Thấp
                </option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-primary">{pageInfo.currentPage}</span> /{" "}
                {pageInfo.totalPages}
              </div>
              <div className="join">
                <button
                  className="join-item btn btn-sm btn-outline bg-base-100 border-base-300 px-3"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  className="join-item btn btn-sm btn-outline bg-base-100 border-base-300 px-3"
                  disabled={page === pageInfo.totalPages}
                  onClick={() => handlePageChange(page + 1)}
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-5 gap-2.5">
              {Array.from({ length: 25 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-base-100 p-2 border border-base-200"
                >
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
                            ₫
                            {product.price
                              ? product.price.toLocaleString("vi-VN")
                              : 0}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-warning text-[10px]">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 mr-0.5 fill-current"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>
                                {product.averageRating ||
                                  product.rating ||
                                  "0.0"}
                              </span>
                            </div>
                            <span className="text-[10px] text-base-content/60">
                              Đã bán{" "}
                              {product.soldCount >= 1000
                                ? (product.soldCount / 1000).toFixed(1) + "k"
                                : product.soldCount}
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {Array.from({ length: pageInfo.totalPages }).map(
                      (_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`join-item btn btn-sm border-none w-8 h-8 rounded-sm font-medium text-sm ${page === pageNum ? "bg-primary text-white hover:bg-primary" : "bg-transparent text-base-content/70 hover:text-primary hover:bg-transparent"}`}
                          >
                            {pageNum}
                          </button>
                        );
                      },
                    )}

                    <button
                      className="join-item btn btn-sm bg-transparent border-none text-base-content/60 hover:text-primary hover:bg-transparent"
                      disabled={page === pageInfo.totalPages}
                      onClick={() => handlePageChange(page + 1)}
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
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
