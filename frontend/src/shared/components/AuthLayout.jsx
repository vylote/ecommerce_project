import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

export default function AuthLayout({ children }) {
  const { lang, changeLanguage, t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-[#E2E5E9] text-base-content">
      <header className="bg-base-100 border-b border-[#D1D5DB]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 min-h-20 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="text-xl sm:text-2xl font-bold tracking-wide text-primary focus-visible:outline-primary">
            ECOMMERCE
          </Link>
          <div className="flex items-center gap-1 text-sm" role="group" aria-label={t("auth.language")}>
            {[{ code: "vi", label: "Tiếng Việt" }, { code: "en", label: "English" }].map(({ code, label }) => (
              <button
                key={code}
                type="button"
                aria-pressed={lang === code}
                onClick={() => changeLanguage(code)}
                className={`rounded-lg px-3 py-2 transition-colors focus-visible:outline-primary ${lang === code ? "bg-base-200 text-secondary font-semibold" : "text-base-content/60 hover:bg-base-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center w-full px-4 py-10 sm:py-14">
        <div className="w-full max-w-[440px] rounded-xl bg-base-100 border border-[#D1D5DB] shadow-[0_12px_32px_-12px_rgba(17,24,39,0.2)] overflow-hidden">
          {children}
          <div className="border-t border-gray-200 px-6 py-4 text-center">
            <Link to="/" className="text-sm font-medium text-secondary hover:underline focus-visible:outline-primary focus-visible:outline-offset-4">
              {t("auth.back_to_home")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
