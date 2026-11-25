import { NEW_NOTIFICATION_EVENT, ORDER_UPDATED_EVENT } from "../../shared/constants";
import useReloadableRequest from "../../shared/hooks/useReloadableRequest";
import Pagination from "../../shared/components/Pagination";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../config/api";
import Navbar from "../../shared/components/Navbar";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import { Search } from "lucide-react";
import PurchaseOrderCard from "./PurchaseOrderCard";
import ReviewModal from "./ReviewModal";
import ProfileSidebar from "../account/profile/ProfileSidebar";
import { useI18n } from "../../../i18n";

const pageSize = 10;
const searchBatchSize = 50;

function matchesOrder(order, keyword) {
  const query = keyword.toLocaleLowerCase();
  return String(order.id) === query.replace(/^#/, "")
    || order.shopName?.toLocaleLowerCase().includes(query)
    || order.items?.some((item) => item.productName?.toLocaleLowerCase().includes(query));
}

async function fetchOrderPage(params, signal) {
  const { data } = await api.get("/orders", { params, signal });
  return data.result;
}

export default function OrdersPage() {
  const { t } = useI18n();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [processingId, setProcessingId] = useState(null);

  // State cho dialog xác nhận (thay cho window.confirm)
  const [confirmState, setConfirmState] = useState(null);

  // State cho Đánh giá sản phẩm
  const [reviewOrder, setReviewOrder] = useState(null);

  const tabs = [
    { value: "ALL", label: t("order.tabs.all") },
    { value: "PENDING", label: t("order.tabs.pending") },
    { value: "CONFIRMED", label: t("order.tabs.confirmed") },
    { value: "SHIPPING", label: t("order.tabs.shipping") },
    { value: "COMPLETED", label: t("order.tabs.completed") },
    { value: "CANCELLED", label: t("order.tabs.cancelled") },
  ];

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return t("order.tabs.pending");
      case "CONFIRMED":
        return t("order.tabs.confirmed");
      case "SHIPPING":
        return t("order.tabs.shipping");
      case "COMPLETED":
        return t("order.tabs.completed");
      case "CANCELLED":
        return t("order.tabs.cancelled");
      default:
        return status;
    }
  };

  const searching = keyword !== "";
  const requestPage = searching ? 1 : page;
  const loadOrders = useCallback(async (signal) => {
    const params = { page: requestPage, size: searching ? searchBatchSize : pageSize };
    if (activeTab !== "ALL") params.status = activeTab;

    const first = await fetchOrderPage(params, signal);
    const entries = [...(first.data ?? [])];
    if (searching) {
      for (let next = 2; next <= first.totalPages && !signal.aborted; next++) {
        const batch = await fetchOrderPage({ ...params, page: next }, signal);
        entries.push(...(batch.data ?? []));
      }
    }
    if (signal.aborted) return;
    const lastPage = Math.max(1, first.totalPages);
    if (!searching && requestPage > lastPage) {
      setPage(lastPage);
      return;
    }
    setOrders(entries);
    setServerTotalPages(lastPage);
    setLoadError(false);
  }, [requestPage, activeTab, searching]);
  const { loading, reload: fetchOrders } = useReloadableRequest(loadOrders, () => setLoadError(true));

  const matchingOrders = searching ? orders.filter((order) => matchesOrder(order, keyword)) : orders;
  const totalPages = searching ? Math.max(1, Math.ceil(matchingOrders.length / pageSize)) : serverTotalPages;
  const displayPage = Math.min(page, totalPages);
  const displayedOrders = searching
    ? matchingOrders.slice((displayPage - 1) * pageSize, displayPage * pageSize)
    : matchingOrders;

  function applySearch(value) {
    setKeyword(value.trim());
    setPage(1);
  }

  useEffect(() => {
    window.addEventListener(ORDER_UPDATED_EVENT, fetchOrders);
    window.addEventListener(NEW_NOTIFICATION_EVENT, fetchOrders);
    return () => {
      window.removeEventListener(ORDER_UPDATED_EVENT, fetchOrders);
      window.removeEventListener(NEW_NOTIFICATION_EVENT, fetchOrders);
    };
  }, [fetchOrders]);

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    setPage(1);
  };

  const cancelOrderRequest = async (orderId) => {
    try {
      setProcessingId(orderId);
      await api.patch(`/orders/${orderId}/cancel`);
      toast.success(t("order.cancel_success") || "Đã hủy đơn hàng");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể hủy đơn hàng");
    } finally {
      setProcessingId(null);
    }
  };

  const completeOrderRequest = async (orderId) => {
    try {
      setProcessingId(orderId);
      await api.patch(`/orders/${orderId}/complete`);
      toast.success(t("order.complete_success") || "Đã xác nhận hoàn tất đơn hàng");
      fetchOrders();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể hoàn tất đơn hàng",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = (orderId) => {
    setConfirmState({
      title: t("order.cancel_confirm_title"),
      message: t("order.cancel_confirm_message"),
      confirmText: t("order.cancel_confirm_btn"),
      cancelText: t("order.cancel_confirm_cancel"),
      variant: "danger",
      onConfirm: () => cancelOrderRequest(orderId),
    });
  };

  const handleComplete = (orderId) => {
    setConfirmState({
      title: t("order.complete_confirm_title"),
      message: t("order.complete_confirm_message"),
      confirmText: t("order.complete_confirm_btn"),
      cancelText: t("order.complete_confirm_cancel"),
      variant: "primary",
      onConfirm: () => completeOrderRequest(orderId),
    });
  };

  return (
    <div className="min-h-screen bg-base-200 pb-10 text-base-content">
      <Navbar />

      <div className="mx-auto flex max-w-[1280px] gap-6 px-4 py-5 md:px-6 md:py-7">
        <aside className="hidden md:block">
          <ProfileSidebar />
        </aside>

        <main className="min-w-0 flex-1 space-y-4 [--rounded-btn:0.125rem]">
          <h1 className="text-2xl font-bold tracking-tight">{t("order.purchases")}</h1>
          <nav aria-label={t("order.status_filter")} className="flex overflow-x-auto rounded-xl border border-base-300 bg-base-100 px-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-pressed={activeTab === tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`flex-1 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium ${activeTab === tab.value ? "border-primary text-secondary" : "border-transparent text-base-content/70 hover:text-secondary"}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <form
            role="search"
            aria-label={t("order.search")}
            className="flex items-center gap-2 rounded-xl border border-base-300 bg-base-100 p-2 focus-within:ring-2 focus-within:ring-primary/40"
            onSubmit={(event) => {
              event.preventDefault();
              applySearch(String(new FormData(event.currentTarget).get("keyword") || ""));
            }}
          >
            <input
              key={keyword}
              type="search"
              name="keyword"
              defaultValue={keyword}
              aria-label={t("order.search")}
              placeholder={t("order.search_placeholder")}
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
            />
            {keyword && (
              <button type="button" onClick={() => applySearch("")} className="btn btn-ghost btn-sm shrink-0">
                {t("order.clear_search")}
              </button>
            )}
            <button type="submit" aria-label={t("order.search")} className="btn btn-secondary btn-sm shrink-0">
              <Search size={17} aria-hidden="true" />
            </button>
          </form>

          {loading ? (
            <p role="status" className="rounded-2xl border border-base-300 bg-base-100 py-16 text-center text-base-content/65">
              {t("order.loading")}
            </p>
          ) : loadError ? (
            <div role="alert" className="rounded-2xl border border-base-300 bg-base-100 py-12 text-center">
              <p>{t("order.loading_error")}</p>
              <button type="button" className="btn btn-outline btn-secondary btn-sm mt-3" onClick={fetchOrders}>
                {t("order.retry")}
              </button>
            </div>
          ) : displayedOrders.length === 0 ? (
            <p className="rounded-2xl border border-base-300 bg-base-100 py-16 text-center text-base-content/65">
              {t(searching ? "order.no_search_results" : "order.empty")}
            </p>
          ) : (
            <div className="space-y-4">
              {displayedOrders.map((order) => (
                <PurchaseOrderCard
                  key={order.id}
                  order={order}
                  statusLabel={getStatusLabel(order.status)}
                  processing={processingId === order.id}
                  onCancel={handleCancel}
                  onComplete={handleComplete}
                  onReview={setReviewOrder}
                />
              ))}
            </div>
          )}

          {!loading && !loadError && totalPages > 1 && (
            <Pagination currentPage={displayPage} totalPages={totalPages} onPageChange={setPage} className="!justify-center [&_button]:rounded-sm" />
          )}
        </main>
      </div>

      <ConfirmDialog
        state={confirmState}
        onClose={() => setConfirmState(null)}
      />

      <ReviewModal 
        isOpen={!!reviewOrder}
        onClose={() => setReviewOrder(null)}
        order={reviewOrder}
        onSuccess={fetchOrders}
      />
    </div>
  );
}
