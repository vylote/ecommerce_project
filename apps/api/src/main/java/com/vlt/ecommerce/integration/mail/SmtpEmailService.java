package com.vlt.ecommerce.integration.mail;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;

import org.springframework.boot.mail.autoconfigure.MailProperties;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmtpEmailService implements EmailService {

    private final Optional<JavaMailSender> mailSender;
    private final MailProperties mailProperties;

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        JavaMailSender sender = mailSender.orElse(null);
        String fromEmail = mailProperties.getUsername();
        if (sender == null || !StringUtils.hasText(fromEmail)) {
            log.warn("Cannot send OTP email because SMTP is not configured");
            throw new AppException(ErrorCode.OTP_EMAIL_SEND_FAILED);
        }

        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail, "Ecommerce Marketplace");
            helper.setTo(toEmail);
            helper.setSubject("[Ecommerce] Mã xác thực đăng ký tài khoản: " + otp);

            helper.setText(render("otp.html", Map.of("otp", otp)), true);
            sender.send(message);
            log.info("Sent OTP email via SMTP");
        } catch (MessagingException | IOException | MailException | IllegalArgumentException e) {
            log.error("Failed to send OTP email via SMTP (errorType={})", e.getClass().getSimpleName());
            throw new AppException(ErrorCode.OTP_EMAIL_SEND_FAILED);
        }
    }

    @Override
    public void sendNotificationEmail(NotificationEmail notification) {
        Long refId = notification.refId();
        JavaMailSender sender = mailSender.orElse(null);
        String fromEmail = mailProperties.getUsername();
        if (sender == null || !StringUtils.hasText(fromEmail)) {
            log.warn("Skipped notification email because SMTP is not configured (refId={})", refId);
            return;
        }

        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail, "Ecommerce Marketplace");
            helper.setTo(notification.recipientEmail());
            helper.setSubject("[Ecommerce] " + notification.title());

            String recipientName = notification.recipientName();
            String greetingName = (StringUtils.hasText(recipientName)) ? recipientName : "Quý khách";
            Map<String, String> values = Map.of(
                    "greetingName", greetingName,
                    "title", String.valueOf(notification.title()),
                    "content", String.valueOf(notification.content()),
                    "refId", refId == null ? "" : refId.toString());
            helper.setText(render("notification.html", values), true);
            sender.send(message);
            log.info("Sent notification email via SMTP (refId={})", refId);
        } catch (Exception e) {
            log.error("Failed to send notification email via SMTP (refId={}, errorType={})",
                    refId, e.getClass().getSimpleName());
        }
    }

    private String render(String filename, Map<String, String> values) throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/mail/" + filename);
        String template = resource.getContentAsString(StandardCharsets.UTF_8);
        if ("".equals(values.get("refId"))) {
            template = Constants.EMAIL_TEMPLATE_REFERENCE_SECTION_PATTERN.matcher(template).replaceFirst("");
        }

        return Constants.EMAIL_TEMPLATE_PLACEHOLDER_PATTERN.matcher(template).replaceAll(match -> {
            String field = match.group(1);
            String value = values.get(field);
            if (value == null) {
                throw new IllegalArgumentException("Missing email template value: " + field);
            }
            return Matcher.quoteReplacement(HtmlUtils.htmlEscape(value, StandardCharsets.UTF_8.name()));
        });
    }
}
