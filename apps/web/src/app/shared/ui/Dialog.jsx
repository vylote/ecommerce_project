import { useEffect, useId, useRef } from "react";
import { useI18n } from "../../../i18n";

const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

export default function Dialog({
  title,
  onClose,
  size = "lg",
  busy = false,
  closeOnBackdrop = false,
  initialFocusRef,
  children,
}) {
  const { t } = useI18n();
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    initialFocusRef?.current?.focus();

    return () => {
      if (dialog.open) dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [initialFocusRef]);

  useEffect(() => {
    if (!closeOnBackdrop || busy) return;

    const dialog = dialogRef.current;
    const dismissOnBackdrop = (event) => {
      if (event.target === dialog) onClose();
    };

    dialog.addEventListener("click", dismissOnBackdrop);
    return () => dialog.removeEventListener("click", dismissOnBackdrop);
  }, [busy, closeOnBackdrop, onClose]);

  function requestClose() {
    if (!busy) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      className={`m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] ${widths[size]} overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-0 text-base-content shadow-xl backdrop:bg-black/50`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-base-300 bg-base-200 px-6 py-4">
        <h2 id={titleId} className="min-w-0 break-words font-bold">{title}</h2>
        <button type="button" onClick={requestClose} disabled={busy} className="btn btn-sm btn-ghost">
          {t("auth.close")}
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function DialogActions({ children }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-base-300 bg-base-200 px-6 py-4">
      {children}
    </div>
  );
}
