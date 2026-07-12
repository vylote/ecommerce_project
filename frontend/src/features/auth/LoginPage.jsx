import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // Import icon con mắt
import api from '../../shared/utils/api';
import { loginSuccess } from '../../store/slice/authSlice';
import AuthLayout from '../../shared/components/AuthLayout';
import loginBg from '../../assets/login-bg.jpg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // State quản lý việc ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      // 1. Gọi API Login để lấy Token/Cookie
      await api.post('/auth/login', { email, password });
      
      // 2. Gọi API lấy thông tin Profile ngay lập tức để đút vào Redux
      const userRes = await api.get('/auth/me');
      
      // 3. Dispatch dữ liệu thật vào Redux, lúc này Navbar sẽ re-render và có ảnh ngay
      dispatch(loginSuccess({ user: userRes.data.result }));
      
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
            
            {/* VÙNG CHỨA INPUT MẬT KHẨU VÀ ICON CON MẮT */}
            <div className="relative">
              <input
                // Đổi type qua lại giữa text và password
                type={showPassword ? "text" : "password"} 
                placeholder="Tối thiểu 6 ký tự"
                // Thêm pr-10 để chữ không bị tràn vào icon con mắt
                className="input input-bordered w-full bg-base-200 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 placeholder:text-base-content/40 transition-colors pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              
              {/* Nút bấm con mắt */}
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/50 hover:text-base-content transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1" // Không focus vào nút này khi ấn Tab
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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