package com.vlt.ecommerce.integration.mail;

import lombok.Builder;

@Builder
public record NotificationEmail(
        String recipientEmail,
        String recipientName,
        String title,
        String content,
        Long refId
) {
}
