package com.vlt.ecommerce.service.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ZalopayCallbackResponse(
        @JsonProperty("return_code") int code,
        @JsonProperty("return_message") String message
) {
}
