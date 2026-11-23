import { useI18n } from "../i18n";

export default function MarkNotificationRead({ onRead }) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      aria-label={t("notif.mark_read")}
      onClick={(event) => {
        event.stopPropagation();
        onRead();
      }}
      className="whitespace-nowrap rounded-full border border-base-300 bg-base-100 px-2 py-0.5 text-[10px] font-medium text-secondary hover:bg-base-200 focus-visible:outline-primary"
    >
      {t("notif.read_action")}
    </button>
  );
}
