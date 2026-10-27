import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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
          className="group relative w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50/90 active:bg-gray-100 border border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#22B14C]" />
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="font-semibold text-gray-700">
                {t("auth.continue_with_google")}
              </span>
            </>
          )}
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

