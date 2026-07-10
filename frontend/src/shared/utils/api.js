import axios from "axios";
import { store } from "../../store/index";
import { logout } from "../../store/slice/authSlice";

// mặc định trình duyệt không bao giờ tự động gửi cookie chéo tên miền (VD: Frontend cổng 5173 gọi API cổng 8080).
// lúc này nó ép trình duyệt đều phải bốc cái Cookie chứa Access Token đính kèm vào Header
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // BẮT BUỘC CÓ DÒNG NÀY ĐỂ TRÌNH DUYỆT GỬI KÈM COOKIE LÊN BACKEND
  withCredentials: true,
});

// Tưởng tượng user mở trang chủ, trang chủ gọi cùng lúc 3 API: Lấy banner, Lấy sản phẩm nổi bật, Lấy danh mục. Vì Token đã chết, 
// cả 3 API này cùng dính lỗi 401 cùng một tích tắc. Nếu không có hàng đợi, React sẽ gọi API /auth/refresh 3 lần liên tiếp, 
// gây loạn hệ thống và có thể bị lỗi

// Ý nghĩa: Biến isRefreshing giống như đèn đỏ. Khi API đầu tiên bị lỗi 401, nó bật isRefreshing = true (đèn đỏ) và đi gọi Refresh.
//  API thứ 2 và thứ 3 bị 401 chạy tới, thấy đèn đỏ thì tự động xếp hàng vào mảng failedQueue để nằm chờ. Khi Refresh xong, 
//  hàm processQueue sẽ gọi cả hàng đợi này chạy lại với Token mới.

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(api(prom.originalRequest)); // Không cần set Authorization Header nữa
  });
  failedQueue = [];
};

// bộ chặn 
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log(`[API-1] Interceptor bắt được lỗi từ: ${originalRequest.url} | Status: ${error.response?.status}`);

    // Ý nghĩa: Nếu chính cái API đi xin Token (/auth/refresh) mà cũng bị lỗi 401 (nghĩa là Refresh Token cũng chết luôn rồi), ta 
    // phải từ chối nó ngay lập tức. Nếu không có đoạn này, nó lại tiếp tục chui xuống dưới, gọi lại /auth/refresh, 
    // rồi lại lỗi 401, rồi lại gọi... tạo thành vòng lặp vô tận làm treo trình duyệt.
    if (
      originalRequest.url.includes('/auth/login') || 
      originalRequest.url.includes('/auth/register') ||
      originalRequest.url.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // Bắt đúng lỗi 401, và check cờ originalRequest._retry để chắc chắn API này chưa từng được gọi thử lại.
    // Nếu isRefreshing == true, nhét Request này vào failedQueue. Hàm trả về một Promise đang ở trạng thái pending (treo đó chưa xong),
    // giúp giao diện người dùng không bị văng lỗi.
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
        processQueue(null); // Báo cho hàng đợi: "Thành công rồi, các anh em gọi lại API gốc đi!"
        return api(originalRequest); 
        
      } catch (refreshError) {
        console.error("[API-6] Refresh THẤT BẠI! Chuẩn bị reject promise...", refreshError);
        isRefreshing = false;
        
        try {
           processQueue(refreshError); // Báo cho hàng đợi: "Toang rồi, báo lỗi hết đi!"
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
