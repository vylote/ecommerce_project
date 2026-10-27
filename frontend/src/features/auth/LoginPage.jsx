import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import api from '../../shared/utils/api';
import { loginSuccess } from '../../store/slice/authSlice';
import AuthLayout from '../../shared/components/AuthLayout';
import loginBg from '../../assets/login-bg.jpg';
import { useI18n } from '../../shared/i18n';
import GoogleAuthButton from './GoogleAuthButton';

export default function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State quản lý việc ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showLockedModal, setShowLockedModal] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('account_locked_alert') === 'true') {
      setShowLockedModal(true);
      localStorage.removeItem('account_locked_alert');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      // 1. Gọi API Login để lấy Token/Cookie
      await api.post('/auth/login', { email, password });
      
      // 2. Gọi API lấy thông tin Profile ngay lập tức để đút vào Redux
      const userRes = await api.get('/auth/me');
      
      // 3. Dispatch dữ liệu thật vào Redux, lúc này Navbar sẽ re-render và có ảnh ngay
      const userData = userRes.data.result;
      dispatch(loginSuccess({ user: userData }));
      
      if (userData.roles?.some(r => r.name === 'ROLE_ADMIN')) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.code === 1025) {
        setErrorMsg(t("auth.error_locked"));
      } else {
        setErrorMsg(t("auth.error_invalid_credentials"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout bgImage={loginBg}>
      <div className="p-7 sm:p-9">
        {/* Header Icon & Title */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 border border-green-200/80 mb-3 shadow-inner">
            <Lock className="w-6 h-6 text-[#22B14C]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {t("auth.login_title")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("auth.login_subtitle")}
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2.5 bg-red-50/90 border border-red-200/80 text-red-700 text-sm rounded-xl p-3.5 mb-5 shadow-xs animate-shake">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
            <span className="font-medium text-xs sm:text-sm">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email or Phone input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {t("auth.email_or_phone")}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22B14C] transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={t("auth.email_or_phone_placeholder")}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#22B14C] focus:ring-4 focus:ring-[#22B14C]/15 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all shadow-2xs"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 pl-1">
              {t("auth.email_or_phone_help")}
            </p>
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {t("auth.password")}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#22B14C] hover:text-[#188c3a] transition-colors"
              >
                {t("auth.forgot_password")}
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22B14C] transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"} 
                placeholder={t("auth.password_placeholder")}
                className="w-full pl-10 pr-11 py-2.5 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#22B14C] focus:ring-4 focus:ring-[#22B14C]/15 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all shadow-2xs"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
          </div>

          {/* Remember me row */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#22B14C] focus:ring-[#22B14C] border-gray-300 accent-[#22B14C] cursor-pointer"
              />
              <span>{t("auth.remember_me")}</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#22B14C] to-[#168a37] hover:from-[#1ea143] hover:to-[#13762f] shadow-lg shadow-[#22B14C]/30 hover:shadow-[#22B14C]/45 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{t("auth.login_btn")}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0 select-none">
            {t("auth.or")}
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Sign-in Button */}
        <div className="mb-5">
          <GoogleAuthButton />
        </div>

        {/* Register footer link */}
        <div className="rounded-2xl bg-gray-50/80 border border-gray-100 p-3.5 text-center">
          <p className="text-xs text-gray-600">
            {t("auth.new_to_shop")}{' '}
            <Link
              to="/register"
              className="font-bold text-[#22B14C] hover:text-[#188c3a] underline-offset-2 hover:underline transition-all inline-flex items-center gap-0.5"
            >
              {t("auth.register_now")}
            </Link>
          </p>
        </div>
      </div>

      {showLockedModal && (
        <div className="modal modal-open bg-black/60 backdrop-blur-md">
          <div className="modal-box text-center p-7 bg-white animate-fade-in-up shadow-2xl rounded-3xl border border-gray-100">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-extrabold text-2xl text-gray-900 mb-2">
              {t("auth.account_locked_title")}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed py-2">
              {t("auth.account_locked_desc")}
            </p>
            <div className="modal-action justify-center mt-6">
              <button 
                className="btn w-full bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold border-none shadow-lg shadow-red-500/25 cursor-pointer" 
                onClick={() => setShowLockedModal(false)}
              >
                {t("auth.understand_btn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}