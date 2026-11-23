package com.vlt.ecommerce;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.mail.autoconfigure.MailProperties;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableConfigurationProperties(MailProperties.class)
@EnableMethodSecurity
public class EcommerceApplication {

	@PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
    }

	public static void main(String[] args) {
		SpringApplication.run(EcommerceApplication.class, args);
	}

}
