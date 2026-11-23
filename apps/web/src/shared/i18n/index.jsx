import { useContext } from "react";
import { I18nContext } from "./context";

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      lang: 'vi',
      changeLanguage: () => {},
      t: (key, defaultText) => defaultText || key,
    };
  }
  return context;
};
