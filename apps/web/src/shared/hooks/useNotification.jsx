import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import api from "../utils/api";

const NOTIFICATION_SOCKET_URL = import.meta.env.VITE_NOTIFICATION_URL || "http://localhost:3000";

// Singleton socket để toàn bộ ứng dụng chỉ duy trì đúng 1 kết nối duy nhất (tránh HMR tạo nhiều socket)
let globalSocket = typeof window !== "undefined" ? window.__GLOBAL_ECOMMERCE_SOCKET__ || null : null;
let globalSocketUserId = typeof window !== "undefined" ? window.__GLOBAL_ECOMMERCE_SOCKET_USER_ID__ || null : null;
const socketListeners = new Set();
const seenNotificationKeys = new Set();

// Cấu hình nhãn và màu sắc cho từng loại thông báo (không dùng icon)
const getNotificationConfig = (type) => {
  switch (type) {
    case "NEW_ORDER":
      return {
        badgeBg: "bg-emerald-100 text-emerald-800",
        borderLeft: "border-emerald-500",
        label: "Đơn hàng mới",
      };
    case "ORDER_CANCELLED":
      return {
        badgeBg: "bg-rose-100 text-rose-800",
        borderLeft: "border-rose-500",
        label: "Đơn bị hủy",
      };
    case "ORDER_CONFIRMED":
      return {
        badgeBg: "bg-blue-100 text-blue-800",
        borderLeft: "border-blue-500",
        label: "Đã xác nhận",
      };
    case "ORDER_SHIPPING":
      return {
        badgeBg: "bg-indigo-100 text-indigo-800",
        borderLeft: "border-indigo-500",
        label: "Đang giao hàng",
      };
    case "ORDER_COMPLETED":
      return {
        badgeBg: "bg-teal-100 text-teal-800",
        borderLeft: "border-teal-500",
        label: "Hoàn tất",
      };
    case "PAYMENT_SUCCESS":
      return {
        badgeBg: "bg-amber-100 text-amber-800",
        borderLeft: "border-amber-500",
        label: "Thanh toán",
      };
    default:
      return {
        badgeBg: "bg-gray-100 text-gray-800",
        borderLeft: "border-blue-500",
        label: "Thông báo",
      };
  }
};

// Xin quyền hiển thị thông báo Desktop từ trình duyệt
const requestDesktopNotificationPermission = () => {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }
};

// Gửi thông báo Native Desktop (như góc dưới phải Windows) khi người dùng ở tab khác hoặc lock screen
const sendDesktopNotification = (payload) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  const isTabInactive = document.hidden || !document.hasFocus();
  if (!isTabInactive) return; // Nếu đang mở và tương tác trên trang web thì dùng Toast in-app

  if (Notification.permission === "granted") {
    try {
      const notif = new Notification(payload.title || "E-Commerce", {
        body: payload.message || "Bạn có thông báo mới từ hệ thống.",
        icon: "/favicon.ico",
        tag: `notif-${payload.id || payload.refId || Date.now()}`,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn("Không thể gửi Desktop Notification:", err);
    }
  }
};

const attachSocketEvents = (socket, userId) => {
  socket.off("connect");
  socket.off("new_notification");
  socket.off("disconnect");

  socket.on("connect", () => {
    console.log(`[+] Socket.IO đã kết nối (${socket.id}). Đăng ký phòng: ${userId}`);
    socket.emit("join", userId);
  });

  socket.on("new_notification", (payload) => {
    console.log("[🔔] Nhận thông báo realtime mới:", payload);

    // Chống duplicate: nếu cùng 1 thông báo bắn đến trong 4s thì bỏ qua
    const notifKey = `${payload.id || payload.refId || payload.title}-${payload.type}`;
    if (seenNotificationKeys.has(notifKey)) {
      console.log("[🔔] Bỏ qua thông báo trùng lặp:", notifKey);
      return;
    }
    seenNotificationKeys.add(notifKey);
    setTimeout(() => seenNotificationKeys.delete(notifKey), 4000);

    // 1. Gửi thông báo hệ thống (Desktop Notification) nếu người dùng đang không focus vào tab này
    sendDesktopNotification(payload);

    // 2. Hiển thị Popup Toast ở GÓC DƯỚI BÊN PHẢI (bottom-right)
    // Cung cấp id duy nhất để react-hot-toast tự động triệt tiêu trùng lặp
    const config = getNotificationConfig(payload.type);
    const toastId = `notif-${payload.id || payload.refId || payload.type}`;

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"
          } max-w-sm w-full bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl pointer-events-auto flex border-l-4 ${
            config.borderLeft
          } p-3.5 border border-gray-100 z-[9999] transition-all duration-300 ease-out`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.badgeBg}`}
              >
                {config.label}
              </span>
              <span className="text-[11px] text-gray-400 ml-auto">Vừa xong</span>
            </div>
            <p className="text-sm font-bold text-gray-900 line-clamp-1">
              {payload.title || "Thông báo mới"}
            </p>
            <p className="mt-0.5 text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {payload.message || "Bạn có thông báo mới từ hệ thống."}
            </p>
          </div>
          <div className="ml-2.5 shrink-0 flex items-start">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600 text-xs font-bold p-1 rounded-md hover:bg-gray-100 transition-colors"
              title="Đóng"
            >
              ✕
            </button>
          </div>
        </div>
      ),
      { id: toastId, duration: 5000, position: "bottom-right" }
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

  socket.on("disconnect", (reason) => {
    console.warn("[-] Socket disconnected:", reason);
  });
};

const getOrCreateSocket = (userId) => {
  if (!userId) return null;

  // Tự động xin quyền Notification khi đăng nhập
  requestDesktopNotificationPermission();

  if (globalSocket && globalSocketUserId === userId && globalSocket.connected) {
    attachSocketEvents(globalSocket, userId);
    return globalSocket;
  }

  if (globalSocket && globalSocketUserId !== userId) {
    globalSocket.disconnect();
    globalSocket = null;
    if (typeof window !== "undefined") {
      window.__GLOBAL_ECOMMERCE_SOCKET__ = null;
      window.__GLOBAL_ECOMMERCE_SOCKET_USER_ID__ = null;
    }
  }

  if (!globalSocket) {
    globalSocketUserId = userId;
    console.log(`[*] Khởi tạo kết nối Socket.IO tới ${NOTIFICATION_SOCKET_URL} cho User ${userId}...`);

    globalSocket = io(NOTIFICATION_SOCKET_URL, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    if (typeof window !== "undefined") {
      window.__GLOBAL_ECOMMERCE_SOCKET__ = globalSocket;
      window.__GLOBAL_ECOMMERCE_SOCKET_USER_ID__ = userId;
    }

    attachSocketEvents(globalSocket, userId);
  }

  return globalSocket;
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
      globalSocketUserId = null;
      if (typeof window !== "undefined") {
        window.__GLOBAL_ECOMMERCE_SOCKET__ = null;
        window.__GLOBAL_ECOMMERCE_SOCKET_USER_ID__ = null;
      }
    }
  });
}

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
