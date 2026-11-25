import StorefrontPopover from "./StorefrontPopover";
import useDismissiblePopover from "../hooks/useDismissiblePopover";
import { useI18n } from "../../../i18n";

const languages = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
];

export default function LanguageMenu() {
  const { lang, changeLanguage } = useI18n();
  const { isOpen, setIsOpen, containerRef, triggerRef, panelId } = useDismissiblePopover();
  const current = languages.find(({ code }) => code === lang) ?? languages[0];

  function closeAndFocus() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      className="relative"
      ref={containerRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setIsOpen((value) => !value)}
        className="rounded py-1 hover:opacity-80 focus-visible:outline focus-visible:outline-2"
      >
        {current.label}
      </button>
      {isOpen && (
        <StorefrontPopover id={panelId} className="w-36 py-1.5 text-xs">
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
        </StorefrontPopover>
      )}
    </div>
  );
}
