import axios from "axios";
import { store } from "../../store/index";
import { logout } from "../../store/slice/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // BẮT BUỘC CÓ DÒNG NÀY ĐỂ TRÌNH DUYỆT GỬI KÈM COOKIE LÊN BACKEND
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(api(prom.originalRequest)); // Không cần set Authorization Header nữa
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log(`[API-1] Interceptor bắt được lỗi từ: ${originalRequest.url} | Status: ${error.response?.status}`);

    if (
      originalRequest.url.includes('/auth/login') || 
      originalRequest.url.includes('/auth/register') ||
      originalRequest.url.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("[API-2] Lỗi 401, kiểm tra xem có đang Refresh không...");
      
      if (isRefreshing) {
        console.log("[API-3] Đang có request khác Refresh rồi, đưa vào hàng đợi...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ originalRequest, resolve, reject });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("[API-4] Bắt đầu gọi /auth/refresh...");
        await api.post('/auth/refresh');
        
        console.log("[API-5] Refresh THÀNH CÔNG! Giải phóng hàng đợi và gọi lại API gốc...");
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest); 
        
      } catch (refreshError) {
        console.error("[API-6] Refresh THẤT BẠI! Chuẩn bị reject promise...", refreshError);
        isRefreshing = false;
        
        try {
           processQueue(refreshError);
           store.dispatch(logout()); 
           console.log("[API-7] Đã dispatch logout thành công.");
        } catch (e) {
           console.error("[API-8] Lỗi nghiêm trọng khi dispatch logout hoặc processQueue:", e);
        }

        return Promise.reject(refreshError); 
      }
    }

    console.log("[API-9] Lỗi không phải 401 hoặc đã retry rồi, trả lỗi về App.jsx");
    return Promise.reject(error);
  }
);

export default api;
