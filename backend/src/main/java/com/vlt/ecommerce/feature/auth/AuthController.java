package com.vlt.ecommerce.feature.auth;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.auth.dto.request.LoginRequest;
import com.vlt.ecommerce.feature.auth.dto.request.RegisterRequest;
import com.vlt.ecommerce.feature.auth.dto.response.TokenResponse;
import com.vlt.ecommerce.feature.user.dto.response.UserResponse;

import com.vlt.ecommerce.feature.auth.dto.request.GoogleCompleteRegistrationRequest;
import com.vlt.ecommerce.feature.auth.dto.request.GoogleLoginRequest;
import com.vlt.ecommerce.feature.auth.dto.response.GoogleAuthResponse;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/auth")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class AuthController {
        AuthService authService;
        GoogleAuthService googleAuthService;
        SessionService sessionService;

        @PostMapping("/send-email-otp")
        public ApiResponse<String> sendEmailOtp(@RequestBody @Valid com.vlt.ecommerce.feature.auth.dto.request.SendOtpRequest request) {
                authService.sendEmailOtp(request);
                return ApiResponse.<String>builder()
                                .result("Mã xác thực OTP đã được gửi đến email của bạn")
                                .build();
        }

        @PostMapping("/register")
        public ApiResponse<UserResponse> register(@RequestBody @Valid RegisterRequest request) {
                return ApiResponse.<UserResponse>builder()
                                .result(authService.register(request))
                                .build();
        }

        @PostMapping("/google")
        public ResponseEntity<ApiResponse<GoogleAuthResponse>> googleLogin(
                        @RequestBody @Valid GoogleLoginRequest request,
                        @RequestHeader(value = "User-Agent", required = false) String userAgent) {
                GoogleAuthResponse authResponse = googleAuthService.authenticateGoogle(request, userAgent);

                if (Boolean.TRUE.equals(authResponse.getIsNewUser())) {
                        return ResponseEntity.ok(ApiResponse.<GoogleAuthResponse>builder()
                                        .result(authResponse)
                                        .build());
                }

                // Nếu là tài khoản cũ -> Nặn cookie đăng nhập
                TokenResponse tokenResponse = authResponse.getTokenResponse();
                ResponseCookie jwtCookie = buildCookie("accessToken", tokenResponse.getAccessToken(), 24 * 60 * 60);
                ResponseCookie refreshCookie = buildCookie("refreshToken", tokenResponse.getRefreshToken(), 7 * 24 * 60 * 60);

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(ApiResponse.<GoogleAuthResponse>builder()
                                                .result(authResponse)
                                                .build());
        }

        @PostMapping("/google/complete-registration")
        public ResponseEntity<ApiResponse<String>> completeGoogleRegistration(
                        @RequestBody @Valid GoogleCompleteRegistrationRequest request,
                        @RequestHeader(value = "User-Agent", required = false) String userAgent) {
                TokenResponse tokenResponse = googleAuthService.completeRegistration(request, userAgent);

                ResponseCookie jwtCookie = buildCookie("accessToken", tokenResponse.getAccessToken(), 24 * 60 * 60);
                ResponseCookie refreshCookie = buildCookie("refreshToken", tokenResponse.getRefreshToken(), 7 * 24 * 60 * 60);

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(ApiResponse.<String>builder()
                                                .result("Đăng ký tài khoản thành công")
                                                .build());
        }

        private ResponseCookie buildCookie(String name, String value, long maxAgeSeconds) {
                return ResponseCookie.from(name, value)
                                .httpOnly(true)
                                .secure(false)
                                .path("/")
                                .maxAge(maxAgeSeconds)
                                .sameSite("Lax")
                                .build();
        }

        @PostMapping("/login")
        public ResponseEntity<ApiResponse<String>> login(
                        @RequestBody @Valid LoginRequest request,
                        @RequestHeader(value = "User-Agent", required = false) String userAgent) {
                TokenResponse tokenResponse = authService.login(request, userAgent);

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
                                .sameSite("Lax")
                                .build();

                ResponseCookie newRefreshCookie = ResponseCookie.from("refreshToken", tokenResponse.getRefreshToken())
                                .httpOnly(true)
                                .secure(false)
                                .path("/")
                                .maxAge(7 * 24 * 60 * 60)
                                .sameSite("Lax")
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, newRefreshCookie.toString())
                                .body(ApiResponse.<String>builder()
                                                .result("Làm mới phiên thành công")
                                                .build());
        }

        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<String>> logout(
                        @CookieValue(name = "accessToken", required = false) String accessToken) {

                authService.logout(accessToken);

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

        @PostMapping("/sessions/revoke")
        public ApiResponse<String> revokeSession(@RequestParam String ssid) {
                sessionService.revokeSession(ssid);
                return ApiResponse.<String>builder()
                                .result("thu hoi thanh cong")
                                .build();
        }
}
