import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../shared/utils/api';
import AuthLayout from '../../shared/components/AuthLayout';
import loginBg from '../../assets/login-bg.jpg';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.post('/auth/register', formData);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!');
    }
  };

  return (
    <AuthLayout bgImage={loginBg}>
      <div className="card-body p-8">
        <h2 className="text-3xl font-extrabold text-center text-base-content mb-1">
          Tạo Tài Khoản
        </h2>
        <p className="text-center text-sm text-base-content/60 mb-6">
          Tham gia mua sắm ngay hôm nay
        </p>

        {errorMsg && (
          <div className="alert alert-error text-sm rounded-xl p-3 mb-5 text-error-content shadow-sm">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="form-control w-full">
            <label className="label w-full justify-start pb-1.5">
              <span className="label-text font-semibold">Họ và tên</span>
            </label>
            <input type="text" name="fullName" placeholder="Nguyễn Văn A" className="input input-bordered w-full bg-base-200 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 placeholder:text-base-content/40 transition-colors" onChange={handleChange} required />
          </div>

          <div className="form-control w-full">
            <label className="label w-full justify-start pb-1.5">
              <span className="label-text font-semibold">Số điện thoại</span>
            </label>
            <input type="tel" name="phone" placeholder="0987654321" className="input input-bordered w-full bg-base-200 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 placeholder:text-base-content/40 transition-colors" onChange={handleChange} required />
          </div>

          <div className="form-control w-full">
            <label className="label w-full justify-start pb-1.5">
              <span className="label-text font-semibold">Email</span>
            </label>
            <input type="email" name="email" placeholder="vidu@email.com" className="input input-bordered w-full bg-base-200 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 placeholder:text-base-content/40 transition-colors" onChange={handleChange} required />
          </div>

          <div className="form-control w-full">
            <label className="label w-full justify-start pb-1.5">
              <span className="label-text font-semibold">Mật khẩu</span>
            </label>
            <input type="password" name="password" placeholder="Tối thiểu 6 ký tự" className="input input-bordered w-full bg-base-200 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 placeholder:text-base-content/40 transition-colors" onChange={handleChange} required minLength={6} />
          </div>

          <div className="form-control pt-4">
            <button type="submit" className="btn btn-primary w-full h-13 text-base font-bold tracking-wide border-none shadow-[0_14px_36px_-8px_rgba(34,177,76,0.6)] hover:shadow-[0_18px_40px_-8px_rgba(34,177,76,0.75)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all">
              ĐĂNG KÝ
            </button>
          </div>
        </form>

        <div className="divider text-base-content/40 text-xs mt-6">HOẶC</div>

        <p className="text-center text-sm text-base-content/70">
          Bạn đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-secondary hover:text-secondary/80 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}