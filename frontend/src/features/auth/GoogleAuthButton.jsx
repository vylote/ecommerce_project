import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';
import { loginSuccess } from '../../store/slice/authSlice';
import { useI18n } from '../../shared/i18n';
import GoogleCompleteModal from './GoogleCompleteModal';

export default function GoogleAuthButton() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State cho modal bổ sung thông tin
  const [modalOpen, setModalOpen] = useState(false);
  const [googleData, setGoogleData] = useState(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const tokenClientRef = useRef(null);

  // Xử lý sau khi lấy được token (access_token) từ Google
  const handleGoogleTokenResponse = async (token) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { accessToken: token });
      const authResult = res.data.result;

      if (authResult.isNewUser) {
        // Tài khoản mới -> Mở modal bổ sung Họ tên, SĐT, Mật khẩu
        setGoogleData({
          email: authResult.email,
          fullName: authResult.fullName || '',
          avatarUrl: authResult.avatarUrl || '',
        });
        setModalOpen(true);
      } else {
        // Tài khoản đã có sẵn -> Đăng nhập thành công ngay
        toast.success(t("auth.login_subtitle") || "Đăng nhập thành công");
        await handleLoginSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Xác thực Google thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập thành công -> lấy thông tin profile và điều hướng
  const handleLoginSuccess = async () => {
    try {
      const userRes = await api.get('/auth/me');
      const userData = userRes.data.result;
      dispatch(loginSuccess({ user: userData }));

      if (userData.roles?.some(r => r.name === 'ROLE_ADMIN')) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin user:", err);
      navigate('/', { replace: true });
    }
  };

  // Khởi tạo Google OAuth2 Token Client
  useEffect(() => {
    if (!clientId) return;

    const setupTokenClient = () => {
      if (window.google?.accounts?.oauth2) {
        try {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'email profile openid',
            callback: (response) => {
              if (response.error) {
                console.warn("Google OAuth error:", response.error);
                return;
              }
              if (response.access_token) {
                handleGoogleTokenResponse(response.access_token);
              }
            },
          });
        } catch (e) {
          console.error("Lỗi khởi tạo Google Token Client:", e);
        }
      }
    };

    if (window.google?.accounts?.oauth2) {
      setupTokenClient();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          setupTokenClient();
          clearInterval(timer);
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [clientId]);

  // Click vào nút Custom Google
  const handleClickGoogle = () => {
    if (loading) return;

    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
      return;
    }

    if (window.google?.accounts?.oauth2 && clientId) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: (response) => {
          if (response.access_token) {
            handleGoogleTokenResponse(response.access_token);
          }
        },
      });
      tokenClientRef.current = client;
      client.requestAccessToken({ prompt: 'select_account' });
      return;
    }

    toast.error("Đang kết nối đến Google, vui lòng thử lại sau giây lát...");
  };

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center">
        {/* Nút Custom 100% chuẩn theo i18n và theme giao diện */}
        <button
          type="button"
          onClick={handleClickGoogle}
          disabled={loading}
          aria-busy={loading}
          className="w-full py-3 px-4 rounded-lg text-sm font-medium text-base-content bg-base-100 hover:bg-base-200 border border-base-300 focus-visible:outline-primary focus-visible:outline-offset-2 transition-colors disabled:opacity-60 disabled:cursor-wait"
        >
          {t(loading ? "auth.connecting_google" : "auth.continue_with_google")}
        </button>
      </div>

      {/* Modal bổ sung Họ tên, Số điện thoại, Mật khẩu khi là User mới */}
      {modalOpen && googleData && (
        <GoogleCompleteModal
          isOpen={modalOpen}
          initialData={googleData}
          onClose={() => setModalOpen(false)}
          onSuccess={async () => {
            setModalOpen(false);
            await handleLoginSuccess();
          }}
        />
      )}
    </>
  );
}

