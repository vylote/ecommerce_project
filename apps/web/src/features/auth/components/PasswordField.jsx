import { useState } from "react";
import { useI18n } from "../../../shared/i18n";

export default function PasswordField({ id, value, onChange, autoComplete, describedBy }) {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={t("auth.password_placeholder")}
        className="w-full pl-3 pr-20 py-3 bg-base-100 border border-secondary/25 hover:border-secondary/40 focus:border-primary focus:ring-2 focus:ring-primary/15 rounded-lg text-sm placeholder:text-base-content/40 outline-none transition-colors"
        value={value}
        onChange={onChange}
        aria-describedby={describedBy}
        required
        minLength={6}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-secondary hover:underline rounded-r-lg focus-visible:outline-primary"
        onClick={() => setShowPassword(!showPassword)}
        aria-controls={id}
        aria-pressed={showPassword}
        aria-label={t(showPassword ? "auth.hide_password" : "auth.show_password")}
      >
        {t(showPassword ? "auth.hide" : "auth.show")}
      </button>
    </div>
  );
}
