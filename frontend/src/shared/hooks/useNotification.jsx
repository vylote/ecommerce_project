import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import api from "../utils/api";

const NOTIFICATION_SOCKET_URL = import.meta.env.VITE_NOTIFICATION_URL || "http://localhost:3000";

// Singleton socket để toàn bộ ứng dụng chỉ duy trì đúng 1 kết nối duy nhất
let globalSocket = null;
let globalSocketUserId = null;
const socketListeners = new Set();

const getOrCreateSocket = (userId) => {
  if (!userId) return null;

  if (globalSocket && globalSocketUserId === userId && globalSocket.connected) {
    return globalSocket;
  }

  if (globalSocket && globalSocketUserId !== userId) {
    globalSocket.disconnect();
    globalSocket = null;
  }

  if (!globalSocket) {
    globalSocketUserId = userId;
    console.log(`[*] Khởi tạo kết nối Socket.IO tới ${NOTIFICATION_SOCKET_URL} cho User ${userId}...`);

    globalSocket = io(NOTIFICATION_SOCKET_URL, {
      transports: ["polling", "websocket"], // Bắt đầu bằng polling rồi tự động upgrade lên websocket mượt mà
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    globalSocket.on("connect", () => {
      console.log(`[+] Socket.IO đã kết nối (${globalSocket.id}). Đăng ký phòng: ${userId}`);
      globalSocket.emit("join", userId);
    });

    globalSocket.on("new_notification", (payload) => {
      console.log("[🔔] Nhận thông báo realtime mới:", payload);

      // Hiển thị Popup Toast nổi bật trên màn hình (chỉ hiển thị 1 lần cho toàn app)
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-sm w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex border-l-4 border-green-500 p-4 border border-gray-100 z-50`}
          >
            <div className="flex-1 w-0">
              <div className="flex items-start">
                <div className="shrink-0 pt-0.5">
                  <span className="text-2xl animate-bounce inline-block">🔔</span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 line-clamp-1">
                    {payload.title || "Thông báo mới"}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                    {payload.message || "Bạn có thông báo mới từ hệ thống."}
                  </p>
                </div>
              </div>
            </div>
            <div className="ml-3 shrink-0 flex items-center">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600 text-xs font-semibold px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ),
        { duration: 6000, position: "top-right" }
      );

      // Thông báo cho tất cả các hook / component đang active
      socketListeners.forEach((callback) => callback(payload));

      // Bắn CustomEvent toàn cục cho các trang tự động reload danh sách
      window.dispatchEvent(new CustomEvent("new_notification", { detail: payload }));
      if (
        payload.type === "NEW_ORDER" ||
        payload.type === "ORDER_CANCELLED" ||
        payload.type === "PAYMENT_SUCCESS"
      ) {
        window.dispatchEvent(new Event("order_updated"));
      }
    });

    globalSocket.on("disconnect", (reason) => {
      console.warn("[-] Socket disconnected:", reason);
    });
  }

  return globalSocket;
};

export const useNotification = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. [HÀNH ĐỘNG 1]: Fetch lịch sử từ Backend Spring Boot
  const fetchHistory = async (page = 1) => {
    if (!userId) return;
    try {
      const response = await api.get(`/notifications?page=${page}&size=20`);
      const pageResult = response.data.result;

      if (pageResult && pageResult.data) {
        const normalized = pageResult.data.map((item) => ({
          ...item,
          isRead: item.isRead === true || item.read === true,
        }));
        setNotifications(normalized);
        const unread = normalized.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch sử thông báo:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  // 2. [HÀNH ĐỘNG 2]: Đăng ký lắng nghe từ Singleton Socket
  useEffect(() => {
    if (!userId) return;

    getOrCreateSocket(userId);

    const handlePayload = (payload) => {
      const normalized = {
        ...payload,
        isRead: payload.isRead === true || payload.read === true,
      };
      setNotifications((prevList) => [normalized, ...prevList]);
      if (!normalized.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socketListeners.add(handlePayload);

    return () => {
      socketListeners.delete(handlePayload);
    };
  }, [userId]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, isRead: true, read: true, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Lỗi đánh dấu đã đọc:", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          read: true,
          readAt: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (e) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", e);
    }
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead, refresh: fetchHistory };
};
