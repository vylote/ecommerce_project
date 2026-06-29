import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../shared/utils/api';
import { logout } from '../../store/slice/authSlice';

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(logout());
      navigate('/login', { replace: true });
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center flex flex-col gap-6 items-center justify-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b')" }}
    >
      <h1 className="text-white text-5xl font-bold bg-black/30 p-5 rounded">
        Chào mừng đến với cửa hàng
      </h1>
      
      <button 
        onClick={handleLogout} 
        className="bg-red-500 text-white px-6 py-2 rounded font-bold shadow hover:bg-red-600 transition-colors"
      >
        ĐĂNG XUẤT
      </button>
    </div>
  );
}