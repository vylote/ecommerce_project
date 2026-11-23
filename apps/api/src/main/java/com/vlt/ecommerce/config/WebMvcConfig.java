package com.vlt.ecommerce.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.PostConstruct;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
    }

    @PostConstruct
    public void diagnosticCheck() {
        System.out.println("\n========== BẮT ĐẦU DÒ TÌM ẢNH BẰNG CLASSPATH ==========");
        try {
            ClassPathResource resource = new ClassPathResource("static/images/categories/quanao.png");
            
            if (resource.exists()) {
                System.out.println("[INFO] [DIAGNOSTIC] DA TIM THAY ANH TRONG CLASSPATH: " + resource.getURL());
                System.out.println("[INFO] [DIAGNOSTIC] Neu trinh duyet van 404, hay xoa cache trinh duyet (Ctrl + F5).");
            } else {
                System.out.println("[WARN] [DIAGNOSTIC] KHONG TIM THAY ANH TRONG CLASSPATH!");
                System.out.println("[WARN] [DIAGNOSTIC] File chua duoc sao chep sang 'target/classes/'. Chay 'mvn clean compile'.");
            }
        } catch (Exception e) {
            System.out.println("[ERROR] [DIAGNOSTIC]: " + e.getMessage());
        }
        System.out.println("=========================================================\n");
    }
}