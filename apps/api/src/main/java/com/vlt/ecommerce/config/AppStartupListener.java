package com.vlt.ecommerce.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AppStartupListener implements ApplicationListener<ApplicationReadyEvent> {

    private final Environment environment;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        String[] activeProfiles = environment.getActiveProfiles();
        String currentProfile = (activeProfiles.length > 0) ? String.join(", ", activeProfiles) : "dev (default)";
        String serverPort = environment.getProperty("server.port", "8080");
        String contextPath = environment.getProperty("server.servlet.context-path", "");
        String rabbitVhost = environment.getProperty("spring.rabbitmq.virtual-host", "ecommerce_dev");
        String mailUsername = environment.getProperty("spring.mail.username", "");

        log.info("\n"
                + "=========================================================================================\n"
                + "[ECOMMERCE BACKEND] ỨNG DỤNG ĐÃ KHỞI ĐỘNG THÀNH CÔNG!\n"
                + "MÔI TRƯỜNG ĐANG CHẠY (PROFILE)   : [{}]\n"
                + "ĐỊA CHỈ API CỦA HỆ THỐNG         : http://localhost:{}{}\n"
                + "RABBITMQ VIRTUAL HOST (VHOST)    : [{}]\n"
                + "GMAIL SMTP GỬI THÔNG BÁO         : [{}]\n"
                + "=========================================================================================",
                currentProfile.toUpperCase(),
                serverPort,
                contextPath,
                rabbitVhost,
                mailUsername.isBlank() ? "CHƯA CẤU HÌNH (MÔ PHỎNG LOG)" : mailUsername
        );
    }
}
