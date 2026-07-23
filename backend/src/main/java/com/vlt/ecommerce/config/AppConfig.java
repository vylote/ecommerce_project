package com.vlt.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableAsync
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppConfig {
    PasswordEncoder passwordEncoder;

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

    //resttemplate như kiểu là postman được nhúng trong java, khi gọi api từ fe dùng axios hoặc fetch
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}