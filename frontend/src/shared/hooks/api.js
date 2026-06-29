import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Tự động gắn token vào header Authorization trước khi gửi
api.interceptors.request.use((config) => {
    // Lấy token từ localStorage (sau khi user đăng nhập)
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});