import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../shared/utils/api';
import { logout } from '../../store/slice/authSlice';

export default function CartHeader() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Top mini bar - giữ nguyên như Navbar chính */}
      <div className="bg-green-800 text-white text-xs">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 md:px-12 py-1.5">
          <div className="flex items-center gap-3">
            <Link to="/seller" className="hover:opacity-80">Kênh Người Bán</Link>
            <span className="w-px h-3 bg-white/30" />
            <a href="#" className="hover:opacity-80">Tải ứng dụng</a>
            <span className="w-px h-3 bg-white/30" />
            <span className="hidden sm:inline">Kết nối</span>
            <div className="hidden sm:flex items-center gap-2">
              <a href="#" aria-label="Facebook" className="hover:opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="hover:opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c2.7 0 3.1 0 4.1.1 1.1 0 1.8.2 2.2.4a4.5 4.5 0 012.2 2.2c.2.4.4 1.1.4 2.2.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c0 1.1-.2 1.8-.4 2.2a4.5 4.5 0 01-2.2 2.2c-.4.2-1.1.4-2.2.4-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1.1 0-1.8-.2-2.2-.4a4.5 4.5 0 01-2.2-2.2c-.2-.4-.4-1.1-.4-2.2C3 15.1 3 14.7 3 12s0-3.1.1-4.1c0-1.1.2-1.8.4-2.2a4.5 4.5 0 012.2-2.2c.4-.2 1.1-.4 2.2-.4C8.9 3 9.3 3 12 3zm0 3.8a5.2 5.2 0 100 10.4 5.2 5.2 0 000-10.4zm0 8.6a3.4 3.4 0 110-6.8 3.4 3.4 0 010 6.8zm5.4-8.8a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 hover:opacity-80">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Thông báo
            </button>
            <span className="w-px h-3 bg-white/30" />
            <button className="hover:opacity-80">Hỗ trợ</button>
            <span className="w-px h-3 bg-white/30" />
            <button className="flex items-center gap-1 hover:opacity-80">
              Tiếng Việt
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {user && (
              <>
                <span className="w-px h-3 bg-white/30" />
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </span>
                  {user.fullName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main bar - rút gọn cho trang Giỏ hàng: chỉ Logo | "Giỏ hàng" + thanh tìm kiếm */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center gap-6 px-4 md:px-12 py-3">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <span className="text-2xl font-black text-white tracking-wider">
              ECOMMERCE
            </span>
            <span className="w-px h-6 bg-white/40" />
            <span className="text-white text-base font-medium">Giỏ hàng</span>
          </Link>

          <form onSubmit={handleSearch} className="join flex-1 min-w-0">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              className="input join-item w-full bg-white text-base-content border-none focus:outline-none"
            />
            <button type="submit" className="btn join-item bg-green-700 hover:bg-green-800 border-none text-white px-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </button>
          </form>

          <div className="flex items-center gap-4 shrink-0">
            {user ? (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full border-2 border-white bg-green-800 flex items-center justify-center font-bold text-white">
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
                <Link to="/login" className="btn btn-ghost btn-sm text-white font-semibold hover:bg-white/10">Đăng nhập</Link>
                <div className="w-px h-4 bg-white/40"></div>
                <Link to="/register" className="btn btn-sm bg-white text-green-700 border-none font-semibold hover:bg-green-50">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}