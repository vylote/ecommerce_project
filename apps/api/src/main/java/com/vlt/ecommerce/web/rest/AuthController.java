package com.vlt.ecommerce.web.rest;

import java.time.Duration;

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

import com.vlt.ecommerce.service.AuthService;
import com.vlt.ecommerce.service.GoogleAuthService;
import com.vlt.ecommerce.service.SessionService;
import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.service.dto.response.ApiResponse;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.service.dto.request.LoginRequest;
import com.vlt.ecommerce.service.dto.request.RegisterRequest;
import com.vlt.ecommerce.service.dto.request.SendOtpRequest;
import com.vlt.ecommerce.service.dto.response.TokenResponse;
import com.vlt.ecommerce.service.dto.response.UserResponse;

import com.vlt.ecommerce.service.dto.request.GoogleCompleteRegistrationRequest;
import com.vlt.ecommerce.service.dto.request.GoogleLoginRequest;
import com.vlt.ecommerce.service.dto.response.GoogleAuthResponse;

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
        private static final String REFRESH_TOKEN_COOKIE = "refreshToken";
        private static final long ACCESS_COOKIE_MAX_AGE_SECONDS = Duration.ofDays(1).toSeconds();
        private static final long REFRESH_COOKIE_MAX_AGE_SECONDS = Duration.ofDays(7).toSeconds();

        AuthService authService;
        GoogleAuthService googleAuthService;
        SessionService sessionService;

        @PostMapping("/send-email-otp")
        public ApiResponse<String> sendEmailOtp(@RequestBody @Valid SendOtpRequest request) {
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
                        @RequestHeader(value = HttpHeaders.USER_AGENT, required = false) String userAgent) {
                GoogleAuthResponse authResponse = googleAuthService.authenticateGoogle(request, userAgent);

                if (Boolean.TRUE.equals(authResponse.getIsNewUser())) {
                        return ResponseEntity.ok(ApiResponse.<GoogleAuthResponse>builder()
                                        .result(authResponse)
                                        .build());
                }

                // Nếu là tài khoản cũ -> Nặn cookie đăng nhập
                TokenResponse tokenResponse = authResponse.getTokenResponse();
                ResponseCookie jwtCookie = buildCookie(Constants.ACCESS_TOKEN_COOKIE, tokenResponse.getAccessToken(), ACCESS_COOKIE_MAX_AGE_SECONDS);
                ResponseCookie refreshCookie = buildCookie(REFRESH_TOKEN_COOKIE, tokenResponse.getRefreshToken(), REFRESH_COOKIE_MAX_AGE_SECONDS);

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
                        @RequestHeader(value = HttpHeaders.USER_AGENT, required = false) String userAgent) {
                TokenResponse tokenResponse = googleAuthService.completeRegistration(request, userAgent);

                ResponseCookie jwtCookie = buildCookie(Constants.ACCESS_TOKEN_COOKIE, tokenResponse.getAccessToken(), ACCESS_COOKIE_MAX_AGE_SECONDS);
                ResponseCookie refreshCookie = buildCookie(REFRESH_TOKEN_COOKIE, tokenResponse.getRefreshToken(), REFRESH_COOKIE_MAX_AGE_SECONDS);

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
                        @RequestHeader(value = HttpHeaders.USER_AGENT, required = false) String userAgent) {
                TokenResponse tokenResponse = authService.login(request, userAgent);

                ResponseCookie jwtCookie = buildCookie(Constants.ACCESS_TOKEN_COOKIE, tokenResponse.getAccessToken(), ACCESS_COOKIE_MAX_AGE_SECONDS);

                ResponseCookie refreshCookie = buildCookie(REFRESH_TOKEN_COOKIE, tokenResponse.getRefreshToken(), REFRESH_COOKIE_MAX_AGE_SECONDS);

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(ApiResponse.<String>builder()
                                                .result("Đăng nhập thành công")
                                                .build());
        }

        @PostMapping("/refresh")
        public ResponseEntity<ApiResponse<String>> refreshToken(
                        @CookieValue(name = REFRESH_TOKEN_COOKIE, required = false) String currentRefreshToken) {

                if (currentRefreshToken == null || currentRefreshToken.isEmpty()) {
                        throw new AppException(ErrorCode.UNAUTHENTICATED);
                }

                TokenResponse tokenResponse = authService.refreshToken(currentRefreshToken);

                ResponseCookie jwtCookie = buildCookie(Constants.ACCESS_TOKEN_COOKIE, tokenResponse.getAccessToken(), ACCESS_COOKIE_MAX_AGE_SECONDS);

                ResponseCookie newRefreshCookie = buildCookie(REFRESH_TOKEN_COOKIE, tokenResponse.getRefreshToken(), REFRESH_COOKIE_MAX_AGE_SECONDS);

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, newRefreshCookie.toString())
                                .body(ApiResponse.<String>builder()
                                                .result("Làm mới phiên thành công")
                                                .build());
        }

        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<String>> logout(
                        @CookieValue(name = Constants.ACCESS_TOKEN_COOKIE, required = false) String accessToken) {

                authService.logout(accessToken);

                ResponseCookie cleanJwtCookie = buildCookie(Constants.ACCESS_TOKEN_COOKIE, "", 0);

                ResponseCookie cleanRefreshCookie = buildCookie(REFRESH_TOKEN_COOKIE, "", 0);

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
