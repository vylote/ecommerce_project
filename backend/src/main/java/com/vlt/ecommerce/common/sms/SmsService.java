package com.vlt.ecommerce.common.sms;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class SmsService {

    public void sendNotificationSms(String phone, String title, String message, Long refId) {
        log.info("==========================================================");
        log.info("📱 [SMS GATEWAY] Bắt đầu điều hướng tin nhắn SMS tới SĐT: {}", phone);
        log.info("📱 [SMS TIÊU ĐỀ] {}", title);
        log.info("📱 [SMS NỘI DUNG] {}", message);
        if (refId != null) {
            log.info("📱 [SMS THAM CHIẾU] Đơn hàng / Mã ref: #{}", refId);
        }
        log.info("==========================================================");

        try {
            // Chuẩn hóa định dạng tin nhắn SMS viễn thông
            String smsBody = String.format("[ECOMMERCE] %s: %s%s",
                    title,
                    message,
                    refId != null ? " (Ref: #" + refId + ")" : ""
            );
            log.info("✅ [SMS GATEWAY] Đã phân phát SMS thành công tới [{}] với nội dung: \"{}\"", phone, smsBody);
        } catch (Exception e) {
            log.error("❌ [SMS GATEWAY] Lỗi khi gửi SMS tới {}: {}", phone, e.getMessage());
        }
    }
}
