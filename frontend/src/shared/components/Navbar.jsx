import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../shared/utils/api';
import { logout } from '../../store/slice/authSlice';

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
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
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 px-4 md:px-12 border-b border-base-300">
      <div className="flex-1 gap-2">
        <Link to="/" className="text-2xl font-black text-primary tracking-wider mr-4">
          ECOMMERCE
        </Link>
        <div className="form-control flex-1 max-w-xl hidden md:block">
          <div className="join w-full">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm, thương hiệu..." 
              className="input input-bordered join-item w-full bg-base-200 border-base-300 focus:border-primary focus:outline-none" 
            />
            <button className="btn btn-primary join-item text-white px-6">
              Tìm
            </button>
          </div>
        </div>
      </div>

      <div className="flex-none gap-4">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="badge badge-sm badge-secondary indicator-item font-bold text-white">0</span>
            </div>
          </div>
        </div>

        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full border-2 border-primary bg-base-300 flex items-center justify-center font-bold text-neutral">
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300">
              <li>
                <div className="font-bold text-base-content px-4 py-2 border-b border-base-200 rounded-none mb-1">
                  {user.fullName}
                </div>
              </li>
              <li><Link to="/profile" className="py-2">Tài khoản của tôi</Link></li>
              <li><Link to="/orders" className="py-2">Đơn mua</Link></li>
              <li>
                <button onClick={handleLogout} className="text-error font-semibold py-2">
                  Đăng xuất
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn btn-ghost btn-sm font-semibold">Đăng nhập</Link>
            <div className="w-px h-4 bg-base-300"></div>
            <Link to="/register" className="btn btn-primary btn-sm text-white font-semibold">Đăng ký</Link>
          </div>
        )}
      </div>
    </div>
  );
}