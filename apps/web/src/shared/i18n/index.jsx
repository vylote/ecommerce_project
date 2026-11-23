import React, { createContext, useContext, useState } from 'react';
import messagesVi from './messages_vi';
import messagesEn from './messages_en';

const messages = {
  vi: messagesVi,
  en: messagesEn,
};

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('app_lang') || 'vi';
  });

  const changeLanguage = (newLang) => {
    if (newLang !== 'vi' && newLang !== 'en') return;
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = (key, defaultText = '') => {
    const currentDict = messages[lang] || messages.vi;
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key];
    }
    // Fallback sang tiếng Việt nếu key chưa có ở ngôn ngữ hiện tại
    if (messages.vi && messages.vi[key] !== undefined) {
      return messages.vi[key];
    }
    return defaultText || key;
  };

  return (
    <I18nContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

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
