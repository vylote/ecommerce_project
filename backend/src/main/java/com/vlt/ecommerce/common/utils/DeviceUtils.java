package com.vlt.ecommerce.common.utils;

public class DeviceUtils {
    public static String parseDeviceInfo(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Thiết bị không xác định";
        }
        
        String os = "HĐH khác";
        String browser = "Trình duyệt khác";
        String uaLower = userAgent.toLowerCase();

        if (uaLower.contains("postman")) {
            return "Postman (API Client)";
        }

        // 1. Phân tích Hệ điều hành (OS)
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

        // 2. Phân tích Trình duyệt (Browser)
        if (uaLower.contains("edg/")) {
            browser = "Edge";
        } else if (uaLower.contains("brave")) { 
            // ĐẶT BRAVE TRƯỚC CHROME: Đón lõng các phiên bản Brave có định danh
            browser = "Brave";
        } else if (uaLower.contains("chrome/") && !uaLower.contains("chromium")) {
            browser = "Chrome";
        } else if (uaLower.contains("safari/") && !uaLower.contains("chrome")) {
            browser = "Safari";
        } else if (uaLower.contains("firefox/")) {
            browser = "Firefox";
        }

        return browser + "-" + os;
    }
}
