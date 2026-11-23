package com.vlt.ecommerce.integration.sms;

public interface SmsService {

    void sendNotificationSms(String phone, String title, String message, Long refId);
}
