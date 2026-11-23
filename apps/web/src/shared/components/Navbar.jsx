import { CART_UPDATED_EVENT, ROLE_ADMIN, ROLE_SELLER } from "../constants";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../../shared/utils/api";
import { useI18n } from "../i18n";
import StorefrontAccountMenu from "./StorefrontAccountMenu";
import StorefrontSearchForm from "./StorefrontSearchForm";
import StorefrontTopBar from "./StorefrontTopBar";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);

  const { t } = useI18n();

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    let ignore = false;

    const fetchCartCount = async () => {
      try {
        const res = await api.get("/cart");
        if (!ignore) setCartCount(res.data.result?.length || 0);
      } catch (error) {
        console.error("Lỗi lấy số lượng giỏ hàng:", error);
      }
    };

    fetchCartCount();

    window.addEventListener(CART_UPDATED_EVENT, fetchCartCount);

    return () => {
      ignore = true;
      window.removeEventListener(CART_UPDATED_EVENT, fetchCartCount);
    };
  }, [user]);

  const displayCartCount = user ? cartCount : 0;



  return (
    <div className="w-full">
      <StorefrontTopBar
        user={user}
        sellerHref={
          user?.roles?.some((role) => role.name === ROLE_SELLER)
            ? "/seller/dashboard"
            : "/seller/onboarding"
        }
        className="py-1.5 px-4 md:px-12 border-b border-white/10"
      >
        {user?.roles?.some((r) => r.name === ROLE_ADMIN) && (
          <>
            <Link to="/admin" className="hover:opacity-80 font-bold text-yellow-300">
              Trang Admin
            </Link>
            <span className="w-px h-3 bg-white/30" />
          </>
        )}
      </StorefrontTopBar>

      {/* Main navbar */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center gap-6 px-4 md:px-12 py-3">
          <Link
            to="/"
            className="text-2xl font-black text-white tracking-wider shrink-0"
          >
            ECOMMERCE
          </Link>

          {/* Cột giữa: search + quick-link nằm ngay dưới */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <StorefrontSearchForm className="w-full" />

            {/* Quick links nằm ngay dưới ô search */}
            <div className="hidden md:flex items-center gap-4 text-xs text-white/90">
              <Link
                to="/category/thoi-trang-nam"
                className="hover:text-white hover:underline"
              >
                {t("category.men_fashion")}
              </Link>
              <Link
                to="/category/thoi-trang-nu"
                className="hover:text-white hover:underline"
              >
                {t("category.women_fashion")}
              </Link>
              <Link
                to="/category/dien-thoai"
                className="hover:text-white hover:underline"
              >
                {t("category.phones_accessories")}
              </Link>
              <Link
                to="/category/nha-cua"
                className="hover:text-white hover:underline"
              >
                {t("category.home_living")}
              </Link>
              <Link
                to="/category/lam-dep"
                className="hover:text-white hover:underline"
              >
                {t("category.beauty")}
              </Link>
              <Link
                to="/category/the-thao"
                className="hover:text-white hover:underline"
              >
                {t("category.sports_travel")}
              </Link>
              <Link
                to="/category/me-be"
                className="hover:text-white hover:underline"
              >
                {t("category.mom_baby")}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* GIỎ HÀNG: bọc bởi Link, hiển thị cartCount */}
            <div className="dropdown dropdown-end">
              <Link
                to="/cart"
                role="button"
                className="btn btn-ghost btn-circle text-white hover:bg-white/10"
                title={t("nav.cart")}
              >
                <div className="indicator">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {displayCartCount > 0 && (
                    <span className="badge badge-sm bg-white text-green-700 border-none indicator-item font-bold">
                      {displayCartCount > 99 ? "99+" : displayCartCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>

            <StorefrontAccountMenu
              user={user}
              avatar={user && (
                <div className="w-10 rounded-full border-2 border-white bg-green-800 flex items-center justify-center font-bold text-white">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-white text-lg">
                      {user.fullName?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
