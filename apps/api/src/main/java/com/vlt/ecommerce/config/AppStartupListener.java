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
        String[] profiles = environment.getActiveProfiles();
        String currentProfile = String.join(", ", profiles.length == 0 ? environment.getDefaultProfiles() : profiles);
        String serverPort = environment.getProperty("server.port", "8080");
        String contextPath = environment.getProperty("server.servlet.context-path", "");
        log.info("API ready (profiles={}, port={}, contextPath={})", currentProfile, serverPort, contextPath);
    }
}
