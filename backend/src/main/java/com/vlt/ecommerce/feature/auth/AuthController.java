package com.vlt.ecommerce.feature.auth;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
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
    public ResponseEntity<ApiResponse<String>> login(@RequestBody @Valid LoginRequest request) {
        TokenResponse tokenResponse = authService.login(request);

        // Nặn Cookie cho Access Token
        ResponseCookie jwtCookie = ResponseCookie.from("accessToken", tokenResponse.getAccessToken())
                .httpOnly(true)
                .secure(false) // Đổi thành true khi deploy lên server thật (có HTTPS)
                .path("/")
                .maxAge(24 * 60 * 60) // 1 ngày
                .sameSite("Lax")
                .build();

        // Nặn Cookie cho Refresh Token
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokenResponse.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 ngày
                .sameSite("Lax")
                .build();

        // Ép Cookie vào Header và trả về kết quả
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.<String>builder()
                        .result("Đăng nhập thành công")
                        .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<String>> refreshToken(
            // Tự động thò tay vào Cookie của Browser lấy ra refreshToken
            @CookieValue(name = "refreshToken", required = false) String currentRefreshToken) {

        if (currentRefreshToken == null || currentRefreshToken.isEmpty()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        TokenResponse tokenResponse = authService.refreshToken(currentRefreshToken);

        ResponseCookie jwtCookie = ResponseCookie.from("accessToken", tokenResponse.getAccessToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("Strict")
                .build();

        ResponseCookie newRefreshCookie = ResponseCookie.from("refreshToken", tokenResponse.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, newRefreshCookie.toString())
                .body(ApiResponse.<String>builder()
                        .result("Làm mới phiên thành công")
                        .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        ResponseCookie cleanJwtCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        ResponseCookie cleanRefreshCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanJwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, cleanRefreshCookie.toString())
                .body(ApiResponse.<String>builder()
                        .result("Đăng xuất thành công")
                        .build());
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(authService.getMyInfo())
                .build();
    }
}
