import { Link } from "react-router-dom";
import LanguageMenu from "./LanguageMenu";
import NotificationDropdown from "./NotificationDropdown";
import UserAvatar from "./UserAvatar";
import { useI18n } from "../../../i18n";

export default function StorefrontTopBar({
  user,
  sellerHref,
  className = "",
  innerClassName = "",
  children,
}) {
  const { t } = useI18n();

  return (
    <div className={`bg-gradient-to-r from-green-700 to-green-600 text-white text-xs ${className}`}>
      <div className={`max-w-[1400px] mx-auto flex items-center justify-between ${innerClassName}`}>
        <div className="flex items-center gap-3">
          {children}
          <Link to={sellerHref} className="hover:opacity-80">
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

          <LanguageMenu />

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
  );
}
