import TextField from "../../shared/ui/TextField";
import PasswordField from "./components/PasswordField";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';
import AuthLayout from '../../shared/components/AuthLayout';
import { useI18n } from '../../shared/i18n';
import AuthAlternatives from "./components/AuthAlternatives";
import EmailOtpModal from './EmailOtpModal';

export default function RegisterPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
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
    <AuthLayout>
      <div className="p-6 sm:p-9">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-base-content">
            {t("auth.register_title")}
          </h1>
          <p className="text-sm text-base-content/60 mt-2">
            {t("auth.register_subtitle")}
          </p>
        </div>

        {errorMsg && (
          <div id="register-error" role="alert" className="bg-error/5 border border-error/30 text-error text-sm rounded-lg p-3 mb-5">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleInitiateRegister} className="space-y-5" aria-busy={isSubmitting}>
          {[
            { name: "fullName", label: "fullname", type: "text", autoComplete: "name" },
            { name: "phone", label: "phone", type: "tel", autoComplete: "tel" },
            { name: "email", label: "email", type: "email", autoComplete: "email" },
          ].map(({ name, label, type, autoComplete }) => (
            <TextField
              key={name}
              id={`register-${name}`}
              label={t(`auth.${label}`)}
              name={name}
              type={type}
              autoComplete={autoComplete}
              placeholder={t(`auth.${label}_placeholder`)}
              value={formData[name]}
              onChange={handleChange}
              aria-describedby={errorMsg ? "register-error" : undefined}
              required
            />
          ))}

          <PasswordField
            id="register-password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            describedBy={errorMsg ? "register-error" : undefined}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-primary-content bg-primary hover:bg-secondary focus-visible:outline-secondary focus-visible:outline-offset-2 transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {t(isSubmitting ? "auth.sending_otp" : "auth.register_btn")}
          </button>
        </form>

        <AuthAlternatives divider={t("auth.or")} prompt={t("auth.already_have_account")} to="/login" linkLabel={t("auth.login_now")} />
      </div>

      {otpModalOpen && (
        <EmailOtpModal
          isOpen={otpModalOpen}
          email={formData.email}
          onClose={() => setOtpModalOpen(false)}
          onConfirm={handleConfirmOtp}
          onResend={handleResendOtp}
          loading={otpLoading}
          errorMsg={otpError}
        />
      )}
    </AuthLayout>
  );
}
