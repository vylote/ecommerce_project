import { useI18n } from "../../../i18n";

export default function MarkNotificationRead({ onRead }) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onRead();
      }}
      className="whitespace-nowrap rounded-md border border-base-300 bg-base-100 px-2 py-0.5 text-[10px] font-semibold text-secondary hover:bg-base-200 focus-visible:outline-primary"
    >
      {t("notif.mark_read")}
    </button>
  );
}
