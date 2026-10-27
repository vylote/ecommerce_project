import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';
import AuthLayout from '../../shared/components/AuthLayout';
import loginBg from '../../assets/login-bg.jpg';
import { useI18n } from '../../shared/i18n';
import GoogleAuthButton from './GoogleAuthButton';
import EmailOtpModal from './EmailOtpModal';

export default function RegisterPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State quản lý OTP Modal
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Khi bấm Đăng Ký -> Gửi mã OTP về email trước
  const handleInitiateRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await api.post('/auth/send-email-otp', { email: formData.email });
      toast.success(t("auth.otp_sent_success"));
      setOtpError('');
      setOtpModalOpen(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || t("auth.register_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Khi người dùng nhập OTP trong Modal -> Gửi thông tin kèm OTP lên backend
  const handleConfirmOtp = async (otp) => {
    setOtpLoading(true);
    setOtpError('');
    try {
      await api.post('/auth/register', { ...formData, otp });
      toast.success(t("auth.register_success"));
      setOtpModalOpen(false);
      navigate('/login');
    } catch (err) {
      setOtpError(err.response?.data?.message || t("auth.otp_invalid"));
    } finally {
      setOtpLoading(false);
    }
  };

  // 3. Gửi lại mã OTP
  const handleResendOtp = async () => {
    try {
      await api.post('/auth/send-email-otp', { email: formData.email });
      toast.success(t("auth.otp_sent_success"));
      setOtpError('');
    } catch (err) {
      setOtpError(err.response?.data?.message || "Không thể gửi lại mã OTP");
    }
  };

  return (
    <AuthLayout bgImage={loginBg}>
      <div className="p-7 sm:p-9">
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 border border-green-200/80 mb-3 shadow-inner">
            <UserPlus className="w-6 h-6 text-[#22B14C]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {t("auth.register_title")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("auth.register_subtitle")}
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2.5 bg-red-50/90 border border-red-200/80 text-red-700 text-sm rounded-xl p-3.5 mb-5 shadow-xs animate-shake">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
            <span className="font-medium text-xs sm:text-sm">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleInitiateRegister} className="space-y-3.5">
          {/* Full Name input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {t("auth.fullname")}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22B14C] transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                name="fullName" 
                placeholder={t("auth.fullname_placeholder")} 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#22B14C] focus:ring-4 focus:ring-[#22B14C]/15 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all shadow-2xs" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Phone input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {t("auth.phone")}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22B14C] transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <input 
                type="tel" 
                name="phone" 
                placeholder={t("auth.phone_placeholder")} 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#22B14C] focus:ring-4 focus:ring-[#22B14C]/15 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all shadow-2xs" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {t("auth.email")}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22B14C] transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input 
                type="email" 
                name="email" 
                placeholder={t("auth.email_placeholder")} 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#22B14C] focus:ring-4 focus:ring-[#22B14C]/15 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all shadow-2xs" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {t("auth.password")}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22B14C] transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder={t("auth.password_placeholder")} 
                className="w-full pl-10 pr-11 py-2.5 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#22B14C] focus:ring-4 focus:ring-[#22B14C]/15 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all shadow-2xs" 
                onChange={handleChange} 
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

          {/* Submit Button */}
          <div className="pt-3">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="group relative w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#22B14C] to-[#168a37] hover:from-[#1ea143] hover:to-[#13762f] shadow-lg shadow-[#22B14C]/30 hover:shadow-[#22B14C]/45 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{t("auth.register_btn")}</span>
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

        {/* Login footer link */}
        <div className="rounded-2xl bg-gray-50/80 border border-gray-100 p-3.5 text-center">
          <p className="text-xs text-gray-600">
            {t("auth.already_have_account")}{' '}
            <Link to="/login" className="font-bold text-[#22B14C] hover:text-[#188c3a] underline-offset-2 hover:underline transition-all inline-flex items-center gap-0.5">
              {t("auth.login_now")}
            </Link>
          </p>
        </div>
      </div>

      {/* Modal Xác thực Email OTP */}
      <EmailOtpModal
        isOpen={otpModalOpen}
        email={formData.email}
        onClose={() => setOtpModalOpen(false)}
        onConfirm={handleConfirmOtp}
        onResend={handleResendOtp}
        loading={otpLoading}
        errorMsg={otpError}
      />
    </AuthLayout>
  );
}