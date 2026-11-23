import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import UserAvatar from "../../shared/components/UserAvatar";
import { useI18n } from "../../shared/i18n";
import StorefrontAccountMenu from "../../shared/components/StorefrontAccountMenu";
import StorefrontSearchForm from "../../shared/components/StorefrontSearchForm";
import StorefrontTopBar from "../../shared/components/StorefrontTopBar";

export default function CartHeader() {
  const { user } = useSelector((state) => state.auth);
  const { t } = useI18n();




  return (
    <div className="sticky top-0 z-50 w-full">
      <StorefrontTopBar
        user={user}
        sellerHref="/seller"
        innerClassName="px-4 md:px-12 py-1.5"
      />

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

          <StorefrontSearchForm className="flex-1 min-w-0" />

          <div className="flex items-center gap-4 shrink-0">
            <StorefrontAccountMenu
              user={user}
              avatar={<UserAvatar user={user} className="w-10 h-10 border-2 border-white" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
