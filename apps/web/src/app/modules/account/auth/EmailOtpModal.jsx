import Dialog from "../../../shared/ui/Dialog";
import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../../../i18n';

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
  const otpInputRef = useRef(null);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading && !isResending && otp.trim().length === 6) onConfirm(otp.trim());
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
    <Dialog title={t("auth.otp_title")} onClose={onClose} size="md" busy={loading || isResending} initialFocusRef={otpInputRef}>
      <div className="p-6 sm:p-8">
        <p className="text-sm text-base-content/60">{t("auth.otp_subtitle")}</p>
        <p className="text-sm font-medium mt-2 mb-6 break-all">{email}</p>

        {errorMsg && (
          <div id="otp-error" role="alert" className="p-3 mb-4 text-sm text-error bg-error/5 border border-error/30 rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading || isResending}>
          <div>
            <label htmlFor="register-otp" className="block text-sm font-medium mb-2">{t("auth.otp_placeholder")}</label>
            <input
              id="register-otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="------"
              ref={otpInputRef}
              className="w-full text-center text-2xl tracking-[0.4em] font-semibold py-3 px-4 bg-base-100 border border-secondary/25 hover:border-secondary/40 focus:border-primary focus:ring-2 focus:ring-primary/15 rounded-lg outline-none transition-colors"
              aria-describedby={errorMsg ? "otp-error" : undefined}
              required
            />
          </div>

          <div className="text-center text-sm text-base-content/60">
            {countdown > 0 ? (
              <span>{t("auth.resend_in")} <span className="font-medium text-secondary">{countdown}s</span></span>
            ) : (
              <button type="button" onClick={handleResend} disabled={isResending || loading} className="font-medium text-secondary hover:underline disabled:opacity-60">
                {t(isResending ? "auth.sending_otp" : "auth.resend_otp_btn")}
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || isResending || otp.length !== 6}
            className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-primary-content bg-primary hover:bg-secondary focus-visible:outline-secondary focus-visible:outline-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {t(loading ? "auth.verifying_otp" : "auth.confirm_register_btn")}
          </button>
        </form>
      </div>
    </Dialog>
  );
}
