package com.vlt.ecommerce.service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ZalopayCallbackRequest(
        @NotBlank @Size(max = 8192) String data,
        @NotBlank @Size(min = 64, max = 64) String mac,
        @NotNull Integer type
) {
}
