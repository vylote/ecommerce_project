package com.vlt.ecommerce.integration.mail;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otp);

    void sendNotificationEmail(NotificationEmail notification);
}
