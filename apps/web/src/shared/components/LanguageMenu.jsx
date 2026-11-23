import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "../i18n";

const languages = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
];

export default function LanguageMenu() {
  const { lang, changeLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  const optionsId = useId();
  const current = languages.find(({ code }) => code === lang) ?? languages[0];

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event) => {
      if (!container.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  function closeAndFocus() {
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <div
      className="relative"
      ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.stopPropagation();
          closeAndFocus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={open ? optionsId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="rounded py-1 hover:opacity-80 focus-visible:outline focus-visible:outline-2"
      >
        {current.label}
      </button>
      {open && (
        <div id={optionsId} className="absolute right-0 z-50 mt-2 w-36 rounded-lg border border-base-300 bg-base-100 py-1.5 text-xs text-base-content shadow-xl">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              lang={code}
              aria-pressed={lang === code}
              className={`block w-full px-3 py-2 text-left hover:bg-base-200 ${lang === code ? "bg-base-200 font-semibold text-secondary" : ""}`}
              onClick={() => {
                changeLanguage(code);
                closeAndFocus();
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
