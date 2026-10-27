import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../../shared/utils/api";
import Navbar from "../../shared/components/Navbar";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import { Store } from "lucide-react";
import ReviewModal from "./ReviewModal";
import ProfileSidebar from "../profile/ProfileSidebar";
import { useI18n } from "../../shared/i18n";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { t } = useI18n();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  useEffect(() => {
    fetchOrders(page);

    const handleRealtimeUpdate = () => {
      fetchOrders(page);
    };

    window.addEventListener("order_updated", handleRealtimeUpdate);
    window.addEventListener("new_notification", handleRealtimeUpdate);

    return () => {
      window.removeEventListener("order_updated", handleRealtimeUpdate);
      window.removeEventListener("new_notification", handleRealtimeUpdate);
    };
  }, [page, activeTab]);

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    setPage(1); // Luôn luôn quay về trang 1 khi đổi bộ lọc
  };

  const fetchOrders = async (pageToLoad) => {
    try {
      setLoading(true);

      const params = { page, size: 10 };
      if (activeTab !== "ALL") {
        params.status = activeTab; // Chỉ gửi status khi nó KHÔNG phải ALL
      }

      const res = await api.get("/orders", { params });
      setOrders(res.data.result.data || []);
      setTotalPages(res.data.result.totalPages || 1);
    } catch (error) {
      toast.error(t("order.loading_error") || "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrderRequest = async (orderId) => {
    try {
      setProcessingId(orderId);
      await api.patch(`/orders/${orderId}/cancel`);
      toast.success(t("order.cancel_success") || "Đã hủy đơn hàng");
      fetchOrders(page);
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
      fetchOrders(page);
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
    <div className="bg-[#f5f5f5] min-h-screen pb-10">
      <Navbar />

      <div className="max-w-[1200px] mx-auto py-6 flex gap-5">
        {/* Sidebar */}
        <ProfileSidebar />

        {/* Main content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex bg-white rounded-sm shadow-sm mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`flex-1 py-4 text-center text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === tab.value
                    ? "text-[#ee4d2d] border-b-2 border-[#ee4d2d]"
                    : "text-gray-700 hover:text-[#ee4d2d]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-sm shadow-sm">
              {t("order.loading")}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-sm shadow-sm text-gray-500 flex flex-col items-center justify-center">
              <div className="text-6xl opacity-30 mb-4">🛒</div>
              {t("order.empty")}
              {activeTab !== "ALL"
                ? ` ${t("order.in_status")} "${getStatusLabel(activeTab)}"`
                : ""}
              .
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const shopLabel = order.shopName || `Đơn #${order.id}`;

                return (
                  <div key={order.id} className="bg-white rounded-sm shadow-sm">
                    {/* Header đơn */}
                    <div className="flex justify-between items-center px-6 py-4 border-b">
                      <div className="flex items-center gap-2 font-medium text-sm text-gray-800">
                        <span className="bg-[#ee4d2d] text-white text-xs px-1.5 py-0.5 rounded-sm">
                          {t("order.favorite")}
                        </span>
                        {shopLabel}
                        <button className="bg-primary/10 text-primary border border-primary px-2 py-0.5 text-xs rounded-sm flex items-center gap-1 hover:bg-primary/20 transition-colors ml-2 cursor-pointer">
                          <Store size={12} /> {t("order.view_shop")}
                        </button>
                      </div>
                      <span
                        className={`text-sm font-medium uppercase ${
                          order.status === "COMPLETED"
                            ? "text-green-600"
                            : order.status === "CANCELLED"
                              ? "text-gray-500"
                              : "text-[#ee4d2d]"
                        }`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    {/* Danh sách sản phẩm trong đơn */}
                    <div className="divide-y divide-gray-100">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => navigate(`/product/${item.productId}`)}
                          className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="w-20 h-20 border shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                            {item.productImageUrl ? (
                              <img
                                src={item.productImageUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl">📦</span>
                            )}
                          </div>
                          <div className="flex-1 text-sm">
                            <div className="line-clamp-2 text-gray-800 text-base">
                              {item.productName}
                            </div>
                            <div className="text-gray-500 mt-2">
                              x{item.quantity}
                            </div>
                          </div>
                          <div className="text-sm shrink-0 flex gap-2 items-center">
                            <span className="text-[#ee4d2d]">
                              ₫{item.productPrice?.toLocaleString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tổng tiền + hành động */}
                    <div className="bg-[#fffefb] px-6 py-5 border-t flex flex-col items-end">
                      <div className="text-sm mb-5 flex items-center">
                        <span className="text-gray-600 mr-2">{t("order.total_amount")}</span>
                        <span className="font-medium text-[#ee4d2d] text-2xl">
                          ₫{order.totalAmount?.toLocaleString("vi-VN")}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            disabled={processingId === order.id}
                            className="w-40 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {t("order.cancel_order")}
                          </button>
                        )}
                        {order.status === "SHIPPING" && (
                          <button
                            onClick={() => handleComplete(order.id)}
                            disabled={processingId === order.id}
                            className="w-40 py-2 text-sm bg-[#ee4d2d] text-white rounded-sm hover:bg-[#d73211] transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {t("order.received_order")}
                          </button>
                        )}
                        {order.status === "COMPLETED" && (
                          <button 
                            onClick={() => !order.reviewed && setReviewOrder(order)}
                            disabled={order.reviewed}
                            className={`w-40 py-2 text-sm rounded-sm transition-colors cursor-pointer ${
                              order.reviewed 
                                ? "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed" 
                                : "text-[#ee4d2d] bg-white border border-[#ee4d2d] hover:bg-orange-50"
                            }`}
                          >
                            {order.reviewed ? t("order.rated") : t("order.rate")}
                          </button>
                        )}
                        {order.status === "CANCELLED" && (
                          <button
                            onClick={() =>
                              navigate(
                                `/product/${order.items?.[0]?.productId}`,
                              )
                            }
                            className="w-40 py-2 text-sm text-[#ee4d2d] bg-white border border-[#ee4d2d] rounded-sm hover:bg-orange-50 transition-colors cursor-pointer"
                          >
                            {t("order.repurchase")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="join shadow-sm">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="join-item btn btn-sm bg-white border-gray-300 hover:bg-gray-100 text-gray-600"
                >
                  «
                </button>
                <button className="join-item btn btn-sm bg-[#ee4d2d] text-white border-[#ee4d2d] hover:bg-[#ee4d2d]">
                  {t("order.page")} {page} / {totalPages}
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="join-item btn btn-sm bg-white border-gray-300 hover:bg-gray-100 text-gray-600"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        state={confirmState}
        onClose={() => setConfirmState(null)}
      />

      <ReviewModal 
        isOpen={!!reviewOrder}
        onClose={() => setReviewOrder(null)}
        order={reviewOrder}
        onSuccess={() => fetchOrders(page)}
      />
    </div>
  );
}
