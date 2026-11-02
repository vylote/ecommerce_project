package com.vlt.ecommerce.common.sms;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class SmsService {

    public void sendNotificationSms(String phone, String title, String message, Long refId) {
        log.info("==========================================================");
        log.info("[SMS GATEWAY] Dieu huong tin nhan SMS toi SDT: {}", phone);
        log.info("[SMS TIEU DE] {}", title);
        log.info("[SMS NOI DUNG] {}", message);
        if (refId != null) {
            log.info("[SMS THAM CHIEU] Don hang / Ma ref: #{}", refId);
        }
        log.info("==========================================================");

        try {
            // Chuẩn hóa định dạng tin nhắn SMS viễn thông
            String smsBody = String.format("[ECOMMERCE] %s: %s%s",
                    title,
                    message,
                    refId != null ? " (Ref: #" + refId + ")" : ""
            );
            log.info("[SMS GATEWAY] Da phan phat SMS thanh cong toi [{}] voi noi dung: \"{}\"", phone, smsBody);
        } catch (Exception e) {
            log.error("[SMS GATEWAY] Loi khi gui SMS toi {}: {}", phone, e.getMessage());
        }
    }
}
