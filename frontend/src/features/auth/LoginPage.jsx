import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../shared/utils/api';
import { loginSuccess } from '../../store/slice/authSlice';
import AuthLayout from '../../shared/components/AuthLayout';
import loginBg from '../../assets/login-bg.jpg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const response = await api.post('/auth/login', { email, password });
      dispatch(loginSuccess({ user: response.data.result }));
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMsg('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  return (
    <AuthLayout bgImage={loginBg}>
      <div className="card-body p-8">
        <h2 className="text-3xl font-extrabold text-center text-base-content mb-1">
          Đăng Nhập
        </h2>
        <p className="text-center text-sm text-base-content/60 mb-6">
          Chào mừng bạn quay lại
        </p>

        {errorMsg && (
          <div className="alert alert-error text-sm rounded-xl p-3 mb-5 text-error-content shadow-sm">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="form-control w-full">
            <label className="label w-full justify-start pb-1.5">
              <span className="label-text font-semibold">Email</span>
            </label>
            <input
              type="email"
              placeholder="vidu@email.com"
              className="input input-bordered w-full bg-base-200 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 placeholder:text-base-content/40 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="label-text-alt text-base-content/50 mt-1.5">
              Dùng email đã đăng ký tài khoản
            </span>
          </div>

          <div className="form-control w-full">
            <div className="flex items-center justify-between pb-1.5">
              <label className="label p-0">
                <span className="label-text font-semibold">Mật khẩu</span>
              </label>
              <Link
                to="/forgot-password"
                className="label-text-alt font-medium text-secondary hover:text-secondary/80 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              className="input input-bordered w-full bg-base-200 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 placeholder:text-base-content/40 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-control pt-2">
            <button
              type="submit"
              className="btn btn-primary w-full h-13 text-base font-bold tracking-wide border-none shadow-[0_14px_36px_-8px_rgba(34,177,76,0.6)] hover:shadow-[0_18px_40px_-8px_rgba(34,177,76,0.75)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all"
            >
              ĐĂNG NHẬP
            </button>
          </div>
        </form>

        <div className="divider text-base-content/40 text-xs">HOẶC</div>

        <p className="text-center text-sm text-base-content/70">
          Mới biết đến chúng tôi?{' '}
          <Link
            to="/register"
            className="font-bold text-secondary hover:text-secondary/80 hover:underline"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}