import { useNavigate, Link } from "react-router-dom";
import { Bell, CheckCheck, Package, Truck, CheckCircle, XCircle, ShoppingBag } from "lucide-react";
import { useI18n } from "../../../i18n";
import useDismissiblePopover from "../hooks/useDismissiblePopover";
import { useNotification } from "../hooks/useNotification.jsx";
import MarkNotificationRead from "./MarkNotificationRead";
import StorefrontPopover from "./StorefrontPopover";

const notificationIcons = {
  ORDER_CONFIRMED: Package,
  ORDER_SHIPPING: Truck,
  ORDER_COMPLETED: CheckCircle,
  PAYMENT_SUCCESS: ShoppingBag,
  NEW_ORDER: ShoppingBag,
  ORDER_CANCELLED: XCircle,
};

export default function NotificationDropdown({ user }) {
  const navigate = useNavigate();
  const { isOpen, setIsOpen, containerRef, triggerRef, panelId } = useDismissiblePopover();
  const { t, lang } = useI18n();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification(user?.id);
  const timestampFormat = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });

  function handleClickButton() {
    if (!user) {
      navigate("/login");
      return;
    }
    setIsOpen((value) => !value);
  }

  return (
    <div className="inline-block text-left" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={handleClickButton}
        className="flex items-center gap-1.5 whitespace-nowrap rounded py-1 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <Bell size={14} aria-hidden="true" />
        <span>{t("nav.notifications")}</span>
        {user && unreadCount > 0 && (
          <span className="min-w-4 rounded-full bg-base-100 px-1.5 text-center text-[10px] font-bold text-secondary">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <StorefrontPopover id={panelId} className="w-96">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-300 px-4 py-3 text-xs">
            <p className="font-semibold text-base-content">
              {t("notif.title")}
              {unreadCount > 0 && (
                <span className="ml-2 whitespace-nowrap font-semibold text-secondary">
                  {unreadCount} {t("notif.unread")}
                </span>
              )}
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="flex items-center gap-1 font-semibold text-secondary hover:underline"
              >
                <CheckCheck size={13} aria-hidden="true" /> {t("notif.mark_all_read")}
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-base-content">{t("notif.empty")}</p>
          ) : (
            <ul className="max-h-[min(20rem,60vh)] overflow-y-auto divide-y divide-base-300">
              {notifications.slice(0, 15).map((notif, index) => {
                const Icon = Object.hasOwn(notificationIcons, notif.type) ? notificationIcons[notif.type] : Bell;
                const createdAt = notif.createdAt ? new Date(notif.createdAt) : null;
                const timestamp = createdAt && !Number.isNaN(createdAt.getTime())
                  ? timestampFormat.format(createdAt)
                  : null;

                return (
                  <li
                    key={notif.id ?? `local-${notif.createdAt}-${index}`}
                    className={`border-l-2 ${notif.isRead ? "border-transparent" : "border-secondary bg-base-200"}`}
                  >
                    <Link
                      to="/orders"
                      onClick={() => {
                        if (!notif.isRead && notif.id) void markAsRead(notif.id);
                        setIsOpen(false);
                      }}
                      className="flex items-start gap-3 px-3.5 pb-1.5 pt-3.5 text-xs hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-base-100 text-secondary ring-1 ring-base-300">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block break-words font-bold">{notif.title}</span>
                        <span className="mt-0.5 block whitespace-pre-line break-words leading-relaxed text-base-content/90">
                          {notif.message}
                        </span>
                      </span>
                    </Link>
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pb-3 pl-[3.625rem] pr-3.5 text-[10px] text-base-content/75">
                      {timestamp && <time dateTime={notif.createdAt}>{timestamp}</time>}
                      {notif.isRead ? (
                        <span>{t("notif.read_status")}</span>
                      ) : notif.id ? (
                        <MarkNotificationRead onRead={() => void markAsRead(notif.id)} />
                      ) : (
                        <span className="font-semibold text-secondary">{t("notif.unread")}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            to="/orders"
            onClick={() => setIsOpen(false)}
            className="block border-t border-base-300 px-4 py-2.5 text-center text-xs font-semibold text-secondary hover:bg-base-200"
          >
            {t("notif.view_all_orders")}
          </Link>
        </StorefrontPopover>
      )}
    </div>
  );
}
