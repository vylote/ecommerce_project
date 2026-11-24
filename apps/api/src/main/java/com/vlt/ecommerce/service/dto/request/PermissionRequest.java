package com.vlt.ecommerce.service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionRequest {
    @NotBlank(message = "{validation.permission.name.required}")
    @Size(max = 100, message = "{validation.permission.name.maxLength}")
    String name;

    @Size(max = 255, message = "{validation.description.maxLength}")
    String description;
}
