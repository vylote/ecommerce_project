package com.vlt.ecommerce.feature.auth;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.feature.auth.dto.request.LoginRequest;
import com.vlt.ecommerce.feature.auth.dto.request.RegisterRequest;
import com.vlt.ecommerce.feature.auth.dto.response.TokenResponse;
import com.vlt.ecommerce.feature.user.dto.response.UserResponse;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/auth")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class AuthController {
    AuthService authService;

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@RequestBody @Valid RegisterRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(authService.register(request))
                .build();
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> register(@RequestBody @Valid LoginRequest request) {
        return ApiResponse.<TokenResponse>builder()
                .result(authService.login(request))
                .build();
    }
}
