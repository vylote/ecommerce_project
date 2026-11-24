package com.vlt.ecommerce.config;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

import jakarta.validation.MessageInterpolator;
import jakarta.validation.ValidatorFactory;
import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer;
import org.springframework.boot.validation.MessageInterpolatorFactory;
import org.springframework.boot.validation.autoconfigure.ValidationConfigurationCustomizer;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

@Configuration
public class I18nConfig {

    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setDefaultLocale(Constants.DEFAULT_LOCALE);
        resolver.setSupportedLocales(List.of(Constants.VIETNAMESE_LOCALE, Locale.ENGLISH));
        return resolver;
    }

    @Bean
    ValidationConfigurationCustomizer englishValidationMessages(MessageSource messageSource) {
        MessageInterpolator delegate = new MessageInterpolatorFactory(messageSource).getObject();
        return configuration -> configuration.messageInterpolator(new MessageInterpolator() {
            @Override
            public String interpolate(String template, Context context) {
                return delegate.interpolate(template, context, Locale.ENGLISH);
            }

            @Override
            public String interpolate(String template, Context context, Locale locale) {
                return interpolate(template, context);
            }
        });
    }

    @Bean
    HibernatePropertiesCustomizer persistenceValidation(ValidatorFactory validatorFactory) {
        return properties -> properties.put("jakarta.persistence.validation.factory", validatorFactory);
    }

    @Bean
    public MessageSource messageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("i18n/messages");
        messageSource.setDefaultEncoding(StandardCharsets.UTF_8.name());
        messageSource.setFallbackToSystemLocale(false);
        return messageSource;
    }
}
