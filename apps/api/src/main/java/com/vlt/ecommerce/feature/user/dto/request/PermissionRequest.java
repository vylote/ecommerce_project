package com.vlt.ecommerce.feature.user.dto.request;

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
    @NotBlank(message = "Tên quyền không được để trống")
    @Size(max = 100, message = "Tên quyền tối đa 100 ký tự")
    String name;

    @Size(max = 255, message = "Mô tả tối đa 255 ký tự")
    String description;
}
