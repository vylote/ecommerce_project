package com.vlt.ecommerce.common.mail;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        log.info("==========================================================");
        log.info("📧 [EMAIL OTP] Mã xác thực gửi đến {}: [{}] (Hạn 5 phút)", toEmail, otp);
        log.info("==========================================================");

        if (mailSender == null || fromEmail == null || fromEmail.isBlank()) {
            log.warn("⚠️ [EMAIL OTP] Chưa cấu hình SMTP Gmail (spring.mail.username). Sử dụng mã OTP trên log console để kiểm thử.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Ecommerce Marketplace");
            helper.setTo(toEmail);
            helper.setSubject("[Ecommerce] Mã xác thực đăng ký tài khoản: " + otp);

            String htmlContent = "<div style=\"font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 28px; border: 1px solid #e5e7eb; border-radius: 18px; background-color: #ffffff;\">"
                    + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                    + "  <h2 style=\"color: #22B14C; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;\">ECOMMERCE</h2>"
                    + "  <p style=\"color: #6b7280; font-size: 14px; margin-top: 4px;\">Xác thực đăng ký tài khoản</p>"
                    + "</div>"
                    + "<p style=\"color: #374151; font-size: 15px; line-height: 1.6;\">Xin chào,</p>"
                    + "<p style=\"color: #374151; font-size: 15px; line-height: 1.6;\">Bạn vừa yêu cầu đăng ký tài khoản tại <strong>Ecommerce Marketplace</strong>. Vui lòng sử dụng mã xác thực dưới đây để hoàn tất đăng ký:</p>"
                    + "<div style=\"background: #f0fdf4; border: 2px dashed #22B14C; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;\">"
                    + "  <span style=\"font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #15803d;\">" + otp + "</span>"
                    + "</div>"
                    + "<p style=\"color: #6b7280; font-size: 13px; line-height: 1.5;\">Mã xác thực này có hiệu lực trong vòng <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai để bảo vệ an toàn thông tin cá nhân của bạn.</p>"
                    + "<hr style=\"border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;\" />"
                    + "<p style=\"color: #9ca3af; font-size: 12px; text-align: center; margin: 0;\">© 2026 Ecommerce Marketplace. All rights reserved.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("✅ [EMAIL OTP] Đã gửi email thành công đến {}", toEmail);
        } catch (Exception e) {
            log.error("❌ [EMAIL OTP] Không thể gửi email qua SMTP: {}", e.getMessage());
        }
    }
}
