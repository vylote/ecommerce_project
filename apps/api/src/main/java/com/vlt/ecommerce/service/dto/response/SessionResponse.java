package com.vlt.ecommerce.service.dto.response;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SessionResponse {
    private String sessionId;
    private String deviceInfo;
    private LocalDateTime createdAt;
    private boolean isCurrentDevice; 
}
