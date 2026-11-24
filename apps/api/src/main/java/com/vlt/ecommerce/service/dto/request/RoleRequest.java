package com.vlt.ecommerce.service.dto.request;

import java.util.List;

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
public class RoleRequest {
    @NotBlank(message = "{validation.role.name.required}")
    @Size(max = 50, message = "{validation.role.name.maxLength}")
    String name;

    @Size(max = 255, message = "{validation.description.maxLength}")
    String description;

    List<Long> permissionIds;
}
