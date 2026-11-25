import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useI18n } from "../../../../i18n";
import api from "../../../config/api";
import Navbar from "../../../shared/components/Navbar";
import Pagination from "../../../shared/components/Pagination";
import FormSelect from "../../../shared/ui/FormSelect";
import CatalogResults from "../catalog/components/CatalogResults";
import CatalogSortControls from "../catalog/components/CatalogSortControls";
import { updateCatalogSearchParams } from "../catalog/catalogSearchParams";
import ShopHero, { ShopFeaturedProducts } from "./ShopHero";

const defaultSort = "averageRating";
const sortFields = new Set([defaultSort, "createdAt", "soldCount", "price"]);
const pageSize = 20;
const productGrid = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 [&>a]:overflow-hidden [&>a]:rounded-xl";

function readPage(value) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 && (page - 1) * pageSize <= 2147483647 ? page : 1;
}

function ShopCatalog({ shopId, categories }) {
  const { t, lang } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const [retry, setRetry] = useState(0);
  const keyword = searchParams.get("keyword")?.trim() || "";
  const requestedCategory = searchParams.get("categoryId");
  const categoryId = categories.some(({ id }) => String(id) === requestedCategory) ? requestedCategory : "";
  const requestedSort = searchParams.get("sortBy");
  const sortBy = sortFields.has(requestedSort) ? requestedSort : defaultSort;
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const page = readPage(searchParams.get("page"));
  const requestKey = JSON.stringify([shopId, keyword, categoryId, sortBy, order, page, retry]);
  const loading = result?.key !== requestKey;
  const pageData = loading ? null : result.data;
  const hasError = !loading && result.error;
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;
  const localizedCount = totalElements.toLocaleString(lang === "en" ? "en-GB" : "vi-VN");
  const productCountLabel = t(totalElements === 1 ? "shop.product_count_one" : "shop.product_count_many")
    .replace("{count}", localizedCount);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      try {
        const { data } = await api.get("/products", {
          params: {
            shopId,
            keyword: keyword || undefined,
            categoryId: categoryId || undefined,
            sortBy,
            order,
            page,
            size: pageSize,
          },
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setResult({ key: requestKey, data: data.result });
      } catch {
        if (!controller.signal.aborted) setResult({ key: requestKey, error: true });
      }
    }
    void loadProducts();
    return () => controller.abort();
  }, [shopId, keyword, categoryId, sortBy, order, page, requestKey]);

  function updateSearch(changes) {
    setSearchParams(updateCatalogSearchParams(searchParams, changes), { preventScrollReset: true });
  }

  function searchShop(event) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("keyword") || "").trim();
    updateSearch({ keyword: query || null, page: null });
  }

  function changePage(nextPage) {
    updateSearch({ page: nextPage === 1 ? null : nextPage });
    document.getElementById("shop-products")?.scrollIntoView({ block: "start" });
  }

  return (
    <section id="shop-products" aria-labelledby="shop-products-title" className="scroll-mt-6 space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 id="shop-products-title" className="text-2xl font-bold tracking-tight">{t("shop.catalog")}</h2>
          {pageData && (
            <p className="mt-1 text-sm text-base-content/65" aria-live="polite">
              {productCountLabel}{keyword && t("shop.keyword_suffix").replace("{keyword}", keyword)}
            </p>
          )}
        </div>
        <form role="search" aria-label={t("shop.search")} onSubmit={searchShop} className="flex w-full items-center overflow-hidden rounded-xl border border-base-300 bg-base-100 focus-within:ring-2 focus-within:ring-primary/50 sm:max-w-xs">
          <input
            key={keyword}
            name="keyword"
            type="search"
            aria-label={t("shop.search_keyword")}
            placeholder={t("shop.search_placeholder")}
            defaultValue={keyword}
            className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
          />
          <button type="submit" aria-label={t("shop.search_submit")} className="self-stretch px-4 text-secondary hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2">
            <Search size={18} aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <CatalogSortControls
          defaultSort={defaultSort}
          defaultLabel={t("shop.top_rated")}
          sortBy={sortBy}
          order={order}
          onSort={(nextSort, nextOrder) => updateSearch({ sortBy: nextSort, order: nextOrder, page: null })}
        />
        <div className="flex flex-wrap items-center gap-2">
          {categories.length > 0 && (
            <FormSelect
              aria-label={t("shop.category_filter")}
              value={categoryId}
              onChange={(event) => updateSearch({ categoryId: event.target.value || null, page: null })}
              controlSize="sm"
              focusColor="green"
            >
              <option value="">{t("shop.all_categories")}</option>
              {categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
            </FormSelect>
          )}
          {(keyword || categoryId) && (
            <button type="button" className="btn btn-ghost btn-sm text-secondary" onClick={() => updateSearch({ keyword: null, categoryId: null, page: null })}>
              {t("shop.clear_filters")}
            </button>
          )}
        </div>
      </div>

      {hasError ? (
        <div role="alert" className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">
          <p>{t("shop.products_error")}</p>
          <button type="button" className="btn btn-outline btn-secondary btn-sm mt-4" onClick={() => setRetry((value) => value + 1)}>{t("shop.retry")}</button>
        </div>
      ) : (
        <CatalogResults
          loading={loading}
          products={pageData?.data ?? []}
          className={productGrid}
          placeholderCount={10}
          emptyMessage={keyword || categoryId ? undefined : t("shop.no_products")}
        />
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={changePage} className="!justify-center" />
      )}
      {page > 1 && pageData && page > totalPages && (
        <div className="text-center">
          <button type="button" className="btn btn-outline btn-secondary btn-sm" onClick={() => changePage(1)}>{t("pagination.first")}</button>
        </div>
      )}
    </section>
  );
}

function ShopStorefront({ shopId }) {
  const { t, lang } = useI18n();
  const [result, setResult] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function loadShop() {
      try {
        const [{ data }, featured] = await Promise.all([
          api.get(`/shops/${shopId}`, { signal }),
          api.get("/products", { params: { shopId, sortBy: "soldCount", order: "desc", size: 3 }, signal })
            .then(({ data }) => data.result, () => null),
        ]);
        if (!signal.aborted) setResult({ shop: data.result, featured, retry });
      } catch (error) {
        if (!signal.aborted) setResult({ error: error.response?.status === 404 ? "missing" : "load", retry });
      }
    }

    void loadShop();
    return () => controller.abort();
  }, [shopId, retry]);

  if (result?.retry !== retry) {
    return <div role="status" className="skeleton flex min-h-24 items-center justify-center rounded-3xl text-base-content/65">{t("shop.loading")}</div>;
  }

  if (!result.shop) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center">
        <h1 className="text-xl font-bold">{t(result.error === "load" ? "shop.load_error" : "shop.not_found")}</h1>
        {result.error === "load" && (
          <button type="button" onClick={() => setRetry((value) => value + 1)} className="btn btn-outline btn-secondary mt-5">{t("shop.retry")}</button>
        )}
      </div>
    );
  }

  const { shop, featured } = result;
  const featuredProducts = featured?.data ?? [];
  const categories = (shop.categories ?? [])
    .filter((category) => category.isActive !== false)
    .sort((first, second) => first.name.localeCompare(second.name, lang));

  return (
    <>
      <ShopHero shop={shop} productCount={featured?.totalElements} />
      {featuredProducts.length > 0 && featured?.totalElements > featuredProducts.length && (
        <ShopFeaturedProducts products={featuredProducts} />
      )}
      <ShopCatalog shopId={shopId} categories={categories} />
    </>
  );
}

export default function ShopPage() {
  const { t } = useI18n();
  const { id } = useParams();
  const validShopId = /^[1-9][0-9]{0,18}$/.test(id ?? "") && BigInt(id) <= 9223372036854775807n;

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />
      <main className="mx-auto w-full max-w-[1400px] space-y-4 px-4 pb-12 pt-5 md:px-12 md:pt-7">
        <nav aria-label={t("shop.breadcrumb")} className="flex items-center gap-2 text-sm text-base-content/65">
          <Link to="/" className="hover:text-secondary hover:underline">{t("shop.home")}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-medium text-base-content">{t("shop.title")}</span>
        </nav>
        {validShopId ? (
          <ShopStorefront key={id} shopId={id} />
        ) : (
          <h1 className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center text-xl font-bold">{t("shop.not_found")}</h1>
        )}
      </main>
    </div>
  );
}
