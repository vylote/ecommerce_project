import { useEffect, useId, useRef } from "react";
import { useI18n } from "../i18n";

const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

export default function Dialog({ title, onClose, size = "lg", closeOnBackdrop = false, children }) {
  const { t } = useI18n();
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClick={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`m-auto max-h-[90dvh] w-[calc(100%-2rem)] ${widths[size]} overflow-y-auto rounded-xl bg-base-100 p-0 text-base-content shadow-xl backdrop:bg-black/50`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-base-300 bg-base-200 px-6 py-4">
        <h2 id={titleId} className="font-bold">{title}</h2>
        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost">{t("auth.close")}</button>
      </div>
      {children}
    </dialog>
  );
}
