package com.vlt.ecommerce.common.utils;

import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LocalizationUtils {
    MessageSource messageSource;

    public static final String DEFAULT_LANG = "vi";

    /**
     * Lấy mã ngôn ngữ hiện tại ("vi" hoặc "en") từ Request Header: Accept-Language hoặc X-Lang
     */
    public String getLanguage() {
        HttpServletRequest request = getCurrentHttpRequest();
        if (request != null) {
            String headerLang = request.getHeader("Accept-Language");
            if (headerLang != null && !headerLang.isBlank()) {
                String firstLang = headerLang.split(",")[0].trim().toLowerCase();
                if (firstLang.startsWith("en")) {
                    return "en";
                }
                if (firstLang.startsWith("vi")) {
                    return "vi";
                }
            }
            String xLang = request.getHeader("X-Lang");
            if (xLang != null && !xLang.isBlank()) {
                return xLang.trim().equalsIgnoreCase("en") ? "en" : "vi";
            }
        }

        Locale currentLocale = LocaleContextHolder.getLocale();
        if (currentLocale != null && "en".equalsIgnoreCase(currentLocale.getLanguage())) {
            return "en";
        }
        return DEFAULT_LANG;
    }

    /**
     * Lấy Locale tương ứng ("vi" hoặc "en")
     */
    public Locale getCurrentLocale() {
        String lang = getLanguage();
        return "en".equalsIgnoreCase(lang) ? Locale.ENGLISH : Locale.of("vi");
    }

    /**
     * Dịch message theo messageKey với Locale hiện tại
     */
    public String getMessage(String messageKey, Object... params) {
        Locale locale = getCurrentLocale();
        return getMessage(messageKey, locale, params);
    }

    /**
     * Dịch message theo messageKey với Locale chỉ định
     */
    public String getMessage(String messageKey, Locale locale, Object... params) {
        try {
            return messageSource.getMessage(messageKey, params, locale);
        } catch (Exception e) {
            log.warn("Không tìm thấy message i18n cho key '{}' với locale '{}'", messageKey, locale);
            return messageKey;
        }
    }

    private HttpServletRequest getCurrentHttpRequest() {
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (requestAttributes instanceof ServletRequestAttributes servletRequestAttributes) {
            return servletRequestAttributes.getRequest();
        }
        return null;
    }
}
