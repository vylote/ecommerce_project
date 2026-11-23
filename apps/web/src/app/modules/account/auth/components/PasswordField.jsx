import { useState } from "react";
import { useI18n } from "../../../../../i18n";
import TextField from "../../../../shared/ui/TextField";

export default function PasswordField({ id, value, onChange, autoComplete, describedBy, labelAction }) {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      id={id}
      label={t("auth.password")}
      labelAction={labelAction}
      name="password"
      type={showPassword ? "text" : "password"}
      autoComplete={autoComplete}
      placeholder={t("auth.password_placeholder")}
      value={value}
      onChange={onChange}
      aria-describedby={describedBy}
      required
      minLength={6}
      trailing={
        <button
          type="button"
          className="absolute inset-y-0 right-0 rounded-r-lg px-3 text-xs font-medium text-secondary hover:underline focus-visible:outline-primary"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-controls={id}
          aria-label={t(showPassword ? "auth.hide_password" : "auth.show_password")}
        >
          {t(showPassword ? "auth.hide" : "auth.show")}
        </button>
      }
    />
  );
}
