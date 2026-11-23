import { useState } from 'react';
import { User, Phone, Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';
import { useI18n } from '../../shared/i18n';

export default function GoogleCompleteModal({ isOpen, onClose, initialData, onSuccess }) {
  const { t } = useI18n();
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await api.post('/auth/google/complete-registration', {
        email: initialData.email,
        fullName: fullName.trim(),
        phone: phone.trim(),
        password,
        avatarUrl: initialData.avatarUrl || null,
      });

      toast.success(t("auth.register_success"));
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || t("auth.register_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-up">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-green-50 to-emerald-100/70 border border-green-200/60 mb-3 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-[#22B14C]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {t("auth.google_complete_title")}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t("auth.google_complete_subtitle")}
            </p>
          </div>

          {/* Email Google đã xác thực */}
          <div className="mb-5 p-3 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  {t("auth.google_verified_email")}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                  {initialData?.email}
                </p>
              </div>
            </div>
            <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-[#22B14C] bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t("auth.verified")}
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Họ và tên */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                {t("auth.fullname")}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22B14C] transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("auth.fullname_placeholder")}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#22B14C] focus:ring-4 focus:ring-[#22B14C]/15 rounded-xl text-sm text-gray-800 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                {t("auth.phone")}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22B14C] transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("auth.phone_placeholder")}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#22B14C] focus:ring-4 focus:ring-[#22B14C]/15 rounded-xl text-sm text-gray-800 outline-none transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 pl-1">
                {t("auth.phone_login_help")}
              </p>
            </div>

            {/* Mật khẩu thiết lập */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                {t("auth.password")}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22B14C] transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.password_placeholder")}
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#22B14C] focus:ring-4 focus:ring-[#22B14C]/15 rounded-xl text-sm text-gray-800 outline-none transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#22B14C] to-[#168a37] hover:from-[#1ea143] hover:to-[#13762f] shadow-lg shadow-[#22B14C]/30 hover:shadow-[#22B14C]/45 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>{t("auth.finish_registration_btn")}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
