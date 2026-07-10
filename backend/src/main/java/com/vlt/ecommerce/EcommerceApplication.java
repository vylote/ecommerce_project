package com.vlt.ecommerce;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
// @EnableMethodSecurity
public class EcommerceApplication {

	@PostConstruct
    public void init() {
        // Thiết lập múi giờ mặc định cho toàn bộ ứng dụng Java là Asia/Ho_Chi_Minh
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
    }
	public static void main(String[] args) {
		SpringApplication.run(EcommerceApplication.class, args);
	}

}
