package com.vlt.ecommerce.security;

import com.vlt.ecommerce.config.Constants;

import java.util.Locale;

public final class DeviceUtils {

    private DeviceUtils() {
    }

    public static String parseDeviceInfo(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Thiết bị không xác định";
        }

        String os = "HĐH khác";
        String browser = "Trình duyệt khác";
        String uaLower = userAgent.toLowerCase(Locale.ROOT);

        if (uaLower.contains("postman")) {
            return "Postman (API Client)";
        }

        if (uaLower.contains("windows")) {
            os = "Windows";
        } else if (uaLower.contains("macintosh") || uaLower.contains("mac os")) {
            os = "macOS";
        } else if (uaLower.contains("iphone")) {
            os = "iPhone (iOS)";
        } else if (uaLower.contains("ipad")) {
            os = "iPad (iOS)";
        } else if (uaLower.contains("android")) {
            os = "Android";
        } else if (uaLower.contains("linux")) {
            os = "Linux";
        }

        if (uaLower.contains("edg/")) {
            browser = "Edge";
        } else if (uaLower.contains("brave")) {
            // Brave can also identify itself as Chrome.
            browser = "Brave";
        } else if (uaLower.contains(Constants.CHROME_USER_AGENT_TOKEN + "/") && !uaLower.contains("chromium")) {
            browser = "Chrome";
        } else if (uaLower.contains("safari/") && !uaLower.contains(Constants.CHROME_USER_AGENT_TOKEN)) {
            browser = "Safari";
        } else if (uaLower.contains("firefox/")) {
            browser = "Firefox";
        }

        return browser + "-" + os;
    }
}
