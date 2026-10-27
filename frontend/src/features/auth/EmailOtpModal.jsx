import { useState, useEffect } from 'react';
import { Mail, ShieldCheck, Loader2, ArrowRight, X, RefreshCw } from 'lucide-react';
import { useI18n } from '../../shared/i18n';

export default function EmailOtpModal({
  isOpen,
  email,
  onClose,
  onConfirm,
  onResend,
  loading,
  errorMsg,
}) {
  const { t } = useI18n();
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setOtp('');
    setCountdown(60);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.trim().length === 6) {
      onConfirm(otp.trim());
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    try {
      await onResend();
      setCountdown(60);
    } finally {
      setIsResending(false);
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
              {t("auth.otp_title")}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t("auth.otp_subtitle")}
            </p>
            <p className="text-sm font-bold text-gray-800 mt-1 bg-gray-50 py-1 px-3 rounded-lg inline-block border border-gray-200">
              {email}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl font-medium text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input mã OTP 6 số */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  autoFocus
                  className="w-full text-center text-2xl tracking-[12px] font-black py-3 px-4 bg-gray-50 hover:bg-white focus:bg-white border-2 border-gray-200 focus:border-[#22B14C] focus:ring-4 focus:ring-[#22B14C]/15 rounded-2xl text-gray-900 outline-none transition-all shadow-inner"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 text-center mt-1.5">
                {t("auth.otp_placeholder")}
              </p>
            </div>

            {/* Resend OTP button & timer */}
            <div className="text-center">
              {countdown > 0 ? (
                <span className="text-xs text-gray-500">
                  {t("auth.resend_in")}{' '}
                  <span className="font-bold text-[#22B14C]">{countdown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22B14C] hover:text-[#188c3a] transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>{t("auth.resend_otp_btn")}</span>
                </button>
              )}
            </div>

            {/* Dev hint */}
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-800 leading-relaxed text-center">
              💡 {t("auth.dev_otp_hint")}
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#22B14C] to-[#168a37] hover:from-[#1ea143] hover:to-[#13762f] shadow-lg shadow-[#22B14C]/30 hover:shadow-[#22B14C]/45 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{t("auth.confirm_register_btn")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
