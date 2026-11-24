package com.vlt.ecommerce.i18n;

import java.util.Locale;

import org.springframework.http.HttpHeaders;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.vlt.ecommerce.config.Constants;

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

    public String getLanguage() {
        HttpServletRequest request = getCurrentHttpRequest();
        if (request != null) {
            String headerLang = request.getHeader(HttpHeaders.ACCEPT_LANGUAGE);
            if (headerLang != null && !headerLang.isBlank()) {
                String firstLang = headerLang.split(",")[0].trim().toLowerCase();
                if (firstLang.startsWith(Constants.ENGLISH_LANGUAGE)) {
                    return Constants.ENGLISH_LANGUAGE;
                }
                if (firstLang.startsWith(Constants.VIETNAMESE_LANGUAGE)) {
                    return Constants.VIETNAMESE_LANGUAGE;
                }
            }
            String xLang = request.getHeader(Constants.ALTERNATE_LANGUAGE_HEADER);
            if (xLang != null && !xLang.isBlank()) {
                String language = xLang.trim();
                if (Constants.VIETNAMESE_LANGUAGE.equalsIgnoreCase(language)) {
                    return Constants.VIETNAMESE_LANGUAGE;
                }
                return Constants.ENGLISH_LANGUAGE.equalsIgnoreCase(language)
                        ? Constants.ENGLISH_LANGUAGE
                        : Constants.DEFAULT_LANGUAGE;
            }
        }

        Locale currentLocale = LocaleContextHolder.getLocale();
        if (Constants.ENGLISH_LANGUAGE.equalsIgnoreCase(currentLocale.getLanguage())) {
            return Constants.ENGLISH_LANGUAGE;
        }
        return Constants.DEFAULT_LANGUAGE;
    }

    public Locale getCurrentLocale() {
        return Locale.forLanguageTag(getLanguage());
    }

    public String getMessage(String messageKey, Object... params) {
        Locale locale = getCurrentLocale();
        return getMessage(messageKey, locale, params);
    }

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
