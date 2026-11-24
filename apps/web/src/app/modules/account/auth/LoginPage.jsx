import { ROLE_ADMIN, USER_LOCKED_ERROR_CODE } from "../../../shared/constants";
import Dialog from "../../../shared/ui/Dialog";
import TextField from "../../../shared/ui/TextField";
import PasswordField from "./components/PasswordField";
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../config/api';
import { loginSuccess } from '../../../config/store/slice/authSlice';
import AuthLayout from '../../../shared/components/AuthLayout';
import { useI18n } from '../../../../i18n';
import AuthAlternatives from "./components/AuthAlternatives";

export default function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const lockedActionRef = useRef(null);
  const [showLockedModal, setShowLockedModal] = useState(
    () => localStorage.getItem('account_locked_alert') === 'true'
  );

  useEffect(() => {
    if (localStorage.getItem('account_locked_alert') === 'true') {
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
      
      if (userData.roles?.some(r => r.name === ROLE_ADMIN)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.code === USER_LOCKED_ERROR_CODE) {
        setErrorMsg(t("auth.error_locked"));
      } else {
        setErrorMsg(t("auth.error_invalid_credentials"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="p-6 sm:p-9">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-base-content">
            {t("auth.login_title")}
          </h1>
          <p className="text-sm text-base-content/60 mt-2">
            {t("auth.login_subtitle")}
          </p>
        </div>

        {errorMsg && (
          <div id="login-error" role="alert" className="bg-error/5 border border-error/30 text-error text-sm rounded-lg p-3 mb-5">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5" aria-busy={isSubmitting}>
          <div>
            <TextField
              id="login-email"
              label={t("auth.email_or_phone")}
              name="username"
              type="text"
              autoComplete="username"
              placeholder={t("auth.email_or_phone_placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={errorMsg ? "login-email-help login-error" : "login-email-help"}
              required
            />
            <p id="login-email-help" className="text-xs text-base-content/60 mt-2">
              {t("auth.email_or_phone_help")}
            </p>
          </div>

          <PasswordField
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            describedBy={errorMsg ? "login-error" : undefined}
            labelAction={
              <Link to="/forgot-password" className="text-xs font-medium text-secondary hover:underline">
                {t("auth.forgot_password")}
              </Link>
            }
          />

          <label className="flex items-center gap-2 cursor-pointer text-sm text-base-content/70">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-base-300 accent-primary cursor-pointer"
            />
            <span>{t("auth.remember_me")}</span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-primary-content bg-primary hover:bg-secondary focus-visible:outline-secondary focus-visible:outline-offset-2 transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {t(isSubmitting ? "auth.logging_in" : "auth.login_btn")}
          </button>
        </form>

        <AuthAlternatives divider={t("auth.or")} prompt={t("auth.new_to_shop")} to="/register" linkLabel={t("auth.register_now")} />
      </div>

      {showLockedModal && (
        <Dialog title={t("auth.account_locked_title")} onClose={() => setShowLockedModal(false)} size="md" initialFocusRef={lockedActionRef}>
          <div className="p-6">
          <p className="text-sm text-base-content/70 leading-relaxed py-2">
            {t("auth.account_locked_desc")}
          </p>
          <div className="modal-action mt-6">
            <button
              type="button"
              className="w-full py-3 rounded-lg font-semibold bg-primary hover:bg-secondary text-primary-content transition-colors"
              onClick={() => setShowLockedModal(false)}
              ref={lockedActionRef}
            >
              {t("auth.understand_btn")}
            </button>
          </div>
          </div>
        </Dialog>
      )}
    </AuthLayout>
  );
}
