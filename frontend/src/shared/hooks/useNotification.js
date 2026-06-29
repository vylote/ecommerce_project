import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../utils/api";

const NOTIFICATION_SOCKET_URL = import.meta.env.VITE_NOTIFICATION_URL;

export const useNotification = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. [HÀNH ĐỘNG 1]: Fetch lịch sử từ Backend Spring Boot
  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const response = await api.get(
          `/notifications?page=${page}&size=${size}`,
        );

        // Cấu trúc của bạn là: response.data (ApiResponse)
        // -> .result (PageResponse)
        // -> .data (List các Notification)
        const pageResult = response.data.result;

        if (pageResult && pageResult.data) {
          setNotifications(pageResult.data);

          // Tính số lượng chưa đọc (isRead == false)
          const unread = pageResult.data.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Lỗi lấy lịch sử thông báo:", error);
      }
    };

    fetchHistory();
  }, [userId]);

  // 2. [HÀNH ĐỘNG 2]: Lắng nghe Socket
  useEffect(() => {
    if (!userId) return;

    const socket = io(NOTIFICATION_SOCKET_URL);

    socket.on("connect", () => {
      socket.emit("join", userId);
    });

    socket.on("new_notification", (payload) => {
      // payload ở đây là NotificationResponse (Object đơn lẻ)
      setNotifications((prevList) => [payload, ...prevList]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, [userId]);

  return { notifications, unreadCount };
};
