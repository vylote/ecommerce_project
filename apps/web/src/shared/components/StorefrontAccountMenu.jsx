import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../store/slice/authSlice";
import { useI18n } from "../i18n";
import api from "../utils/api";

export default function StorefrontAccountMenu({ user, avatar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useI18n();

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

  return user ? (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar cursor-pointer"
      >
        {avatar}
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
  );
}
