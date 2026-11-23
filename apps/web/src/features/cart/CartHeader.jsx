import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import api from "../../shared/utils/api";
import { logout } from "../../store/slice/authSlice";
import UserAvatar from "../../shared/components/UserAvatar";
import NotificationDropdown from "../../shared/components/NotificationDropdown";
import { useI18n } from "../../shared/i18n";

export default function CartHeader() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lang, changeLanguage, t } = useI18n();

  const [keyword, setKeyword] = useState("");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(logout());
      navigate("/login", { replace: true });
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
      {/* Top mini bar */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white text-xs">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 md:px-12 py-1.5">
          <div className="flex items-center gap-3">
            <Link to="/seller" className="hover:opacity-80">
              {t("nav.seller_channel")}
            </Link>
            <span className="w-px h-3 bg-white/30" />
            <a href="#" className="hover:opacity-80">
              {t("nav.download_app")}
            </a>
            <span className="w-px h-3 bg-white/30" />
            <span className="hidden sm:inline">{t("nav.connect")}</span>
            <div className="hidden sm:flex items-center gap-2">
              <a href="#" aria-label="Facebook" className="hover:opacity-80">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="hover:opacity-80">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2c2.7 0 3.1 0 4.1.1 1.1 0 1.8.2 2.2.4a4.5 4.5 0 012.2 2.2c.2.4.4 1.1.4 2.2.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c0 1.1-.2 1.8-.4 2.2a4.5 4.5 0 01-2.2 2.2c-.4.2-1.1.4-2.2.4-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1.1 0-1.8-.2-2.2-.4a4.5 4.5 0 01-2.2-2.2c-.2-.4-.4-1.1-.4-2.2C3 15.1 3 14.7 3 12s0-3.1.1-4.1c0-1.1.2-1.8.4-2.2a4.5 4.5 0 012.2-2.2c.4-.2 1.1-.4 2.2-.4C8.9 3 9.3 3 12 3zm0 3.8a5.2 5.2 0 100 10.4 5.2 5.2 0 000-10.4zm0 8.6a3.4 3.4 0 110-6.8 3.4 3.4 0 010 6.8zm5.4-8.8a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown user={user} />
            <span className="w-px h-3 bg-white/30" />
            <button className="hover:opacity-80">{t("nav.support")}</button>
            <span className="w-px h-3 bg-white/30" />

            {/* DROPDOWN CHUYỂN ĐỔI NGÔN NGỮ */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 hover:opacity-80 py-1 cursor-pointer focus:outline-none"
              >
                <span>{lang === "vi" ? "Tiếng Việt" : "English"}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-3 w-3 transition-transform ${isLangOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-100 py-1.5 z-50 text-xs animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      changeLanguage("vi");
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                      lang === "vi" ? "font-bold text-green-600 bg-green-50/50" : "text-gray-700"
                    }`}
                  >
                    <span>🇻🇳 Tiếng Việt</span>
                    {lang === "vi" && <span className="font-bold">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      changeLanguage("en");
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                      lang === "en" ? "font-bold text-green-600 bg-green-50/50" : "text-gray-700"
                    }`}
                  >
                    <span>🇬🇧 English</span>
                    {lang === "en" && <span className="font-bold">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {user && (
              <>
                <span className="w-px h-3 bg-white/30" />
                <span className="flex items-center gap-1.5">
                  <UserAvatar user={user} className="w-4 h-4" />
                  {user.fullName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center gap-6 px-4 md:px-12 py-3">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <span className="text-2xl font-black text-white tracking-wider">
              ECOMMERCE
            </span>
            <span className="w-px h-6 bg-white/40" />
            <span className="text-white text-base font-medium">{t("cart.title")}</span>
          </Link>

          <form onSubmit={handleSearch} className="join flex-1 min-w-0">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t("nav.search_placeholder")}
              className="input join-item w-full bg-white text-base-content border-none focus:outline-none"
            />
            <button
              type="submit"
              className="btn join-item bg-green-700 hover:bg-green-800 border-none text-white px-6 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
            </button>
          </form>

          <div className="flex items-center gap-4 shrink-0">
            {user ? (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar cursor-pointer"
                >
                  <UserAvatar
                    user={user}
                    className="w-10 h-10 border-2 border-white"
                  />
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300"
                >
                  <li>
                    <div className="font-bold text-base-content px-4 py-2 border-b border-base-200 rounded-none mb-1">
                      {user.fullName}
                    </div>
                  </li>
                  <li>
                    <Link to="/profile" className="py-2">
                      {t("nav.my_account")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" className="py-2">
                      {t("nav.my_orders")}
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="text-error font-semibold py-2 cursor-pointer"
                    >
                      {t("nav.logout")}
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn btn-ghost btn-sm text-white font-semibold hover:bg-white/10"
                >
                  {t("nav.login")}
                </Link>
                <div className="w-px h-4 bg-white/40"></div>
                <Link
                  to="/register"
                  className="btn btn-sm bg-white text-green-700 border-none font-semibold hover:bg-green-50"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
