import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { Toaster } from "react-hot-toast";

import { AppRoutes } from "./routes/AppRoutes";
import { loginSuccess, logout, setInitialized } from "./store/slice/authSlice";
import api from "./shared/utils/api";
import { useNotification } from "./shared/hooks/useNotification";

function App() {
  const dispatch = useDispatch();
  const { isInitialized, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.log("[APP-1] Bắt đầu chạy initAuth...");
      try {
        console.log("[APP-2] Chuẩn bị gọi api.get(/auth/me)...");
        const response = await api.get("/auth/me");

        console.log(
          "[APP-3] Gọi /me THÀNH CÔNG, chuẩn bị dispatch user...",
          response.data,
        );
        dispatch(loginSuccess({ user: response.data.result }));
        console.log("[APP-4] Dispatch user xong.");
      } catch (error) {
        console.error("[APP-5] Nhảy vào CATCH của App.jsx. Lý do:", error);
        if (error.response?.status === 401) {
          dispatch(logout());
        } else {
          toast.error("Không thể kết nối đến máy chủ, vui lòng thử lại sau!");
        }
        console.log("[APP-6] Đã chạy xong dispatch logout trong catch.");
      } finally {
        console.log("[APP-7] Nhảy vào FINALLY. Chuẩn bị tắt Loading...");
        setLoading(false);
        dispatch(setInitialized());
        console.log(
          "[APP-8] Đã tắt loading xong. Trạng thái App sẽ re-render!",
        );
      }
    };

    initAuth();
  }, [dispatch]);

  // 2. KÍCH HOẠT SOCKET.IO (Chỉ kết nối khi đã có thông tin user)
  const currentUserId = user?.id;
  // Lưu ý: Không cần truyền token vào hook nữa vì API tự dùng Cookie
  const { notifications, unreadCount } = useNotification(currentUserId);

  // 3. HIỂN THỊ MÀN HÌNH CHỜ TRONG LÚC GỌI API /auth/me
  if (loading || !isInitialized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F2F2F7]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0088FF]" />
        <p className="mt-4 text-gray-500 font-medium italic">
          Đang xác thực phiên làm việc...
        </p>
      </div>
    );
  }

  // 4. RENDER GIAO DIỆN CHÍNH KHI ĐÃ XÁC THỰC XONG
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppRoutes notifications={notifications} unreadCount={unreadCount} />
    </BrowserRouter>
  );
}

export default App;
