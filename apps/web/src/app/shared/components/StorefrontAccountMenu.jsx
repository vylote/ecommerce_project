import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../config/store/slice/authSlice";
import { useI18n } from "../../../i18n";
import useDismissiblePopover from "../hooks/useDismissiblePopover";
import api from "../../config/api";
import StorefrontPopover from "./StorefrontPopover";
import StorefrontDisplayName from "./StorefrontDisplayName";

export default function StorefrontAccountMenu({ user, avatar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { isOpen, setIsOpen, containerRef, triggerRef, panelId } = useDismissiblePopover();

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
    <div
      className="relative"
      ref={containerRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <button
        type="button"
        ref={triggerRef}
        aria-label={t("nav.my_account")}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setIsOpen((value) => !value)}
        className="btn btn-ghost btn-circle avatar cursor-pointer"
      >
        {avatar}
      </button>
      {isOpen && (
        <StorefrontPopover id={panelId} className="w-52">
          <div className="border-b border-base-300 px-4 py-3 text-sm font-semibold">
            <StorefrontDisplayName name={user.fullName || user.email} />
          </div>
          <ul className="menu menu-sm w-full p-2">
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)} className="py-2">
                {t("nav.my_account")}
              </Link>
            </li>
            <li>
              <Link to="/orders" onClick={() => setIsOpen(false)} className="py-2">
                {t("nav.my_orders")}
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  void handleLogout();
                }}
                className="text-error font-semibold py-2 cursor-pointer"
              >
                {t("nav.logout")}
              </button>
            </li>
          </ul>
        </StorefrontPopover>
      )}
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
