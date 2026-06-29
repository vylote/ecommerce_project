import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../shared/utils/api';
import { loginSuccess } from '../../store/slice/authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      dispatch(loginSuccess({ user: response.data.result }));
      console.log("Login thành công, đang điều hướng...");
      navigate('/');
    } catch (err) {
      alert("Đăng nhập thất bại!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02CD32]/10">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-[#02CD32] mb-6 text-center">Đăng Nhập</h2>
        <form onSubmit={handleLogin}>
          <input className="w-full p-3 mb-4 border rounded" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full p-3 mb-6 border rounded" type="password" placeholder="Mật khẩu" onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-[#02CD32] text-white p-3 rounded font-bold hover:bg-[#02a828]">ĐĂNG NHẬP</button>
        </form>
        <p className="mt-4 text-center text-sm">Chưa có tài khoản? <a href="/register" className="text-[#02CD32]">Đăng ký ngay</a></p>
      </div>
    </div>
  );
}