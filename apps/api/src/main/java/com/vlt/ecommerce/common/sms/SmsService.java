package com.vlt.ecommerce.common.sms;

public interface SmsService {

    void sendNotificationSms(String phone, String title, String message, Long refId);
}
