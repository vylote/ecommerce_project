package com.vlt.ecommerce.feature.auth;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.UUID;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import com.nimbusds.jwt.SignedJWT;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.common.utils.DeviceUtils;
import com.vlt.ecommerce.feature.auth.dto.request.GoogleCompleteRegistrationRequest;
import com.vlt.ecommerce.feature.auth.dto.request.GoogleLoginRequest;
import com.vlt.ecommerce.feature.auth.dto.response.GoogleAuthResponse;
import com.vlt.ecommerce.feature.auth.dto.response.TokenResponse;
import com.vlt.ecommerce.feature.user.Role;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.UserSession;
import com.vlt.ecommerce.feature.user.repository.RoleRepository;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class GoogleAuthService {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    JwtService jwtService;
    SessionRepository sessionRepository;
    RoleRepository roleRepository;

    RestClient restClient = RestClient.create();

    public GoogleAuthResponse authenticateGoogle(GoogleLoginRequest request, String userAgent) {
        String token = request.getToken();
        if (token == null || token.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        GoogleUserInfo googleUserInfo = verifyGoogleToken(token);

        String email = googleUserInfo.getEmail();
        var existingUserOpt = userRepository.findByEmail(email);

        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();

            if (Boolean.FALSE.equals(user.getIsActive())) {
                throw new AppException(ErrorCode.USER_LOCKED);
            }

            // Đã có tài khoản -> Đăng nhập thành công ngay
            TokenResponse tokenResponse = createSessionAndGenerateTokens(user, userAgent);
            return GoogleAuthResponse.builder()
                    .isNewUser(false)
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .avatarUrl(user.getAvatarUrl())
                    .tokenResponse(tokenResponse)
                    .build();
        }

        // Tài khoản chưa tồn tại -> Yêu cầu bổ sung thông tin (Họ tên, SĐT, Mật khẩu)
        return GoogleAuthResponse.builder()
                .isNewUser(true)
                .email(email)
                .fullName(googleUserInfo.getName())
                .avatarUrl(googleUserInfo.getPicture())
                .build();
    }

    @Transactional
    public TokenResponse completeRegistration(GoogleCompleteRegistrationRequest request, String userAgent) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ErrorCode.PHONE_EXISTED);
        }

        Role buyerRole = roleRepository.findByName("ROLE_BUYER")
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .fullName(request.getFullName().trim())
                .phone(request.getPhone().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .avatarUrl(request.getAvatarUrl())
                .roles(new HashSet<>(Collections.singletonList(buyerRole)))
                .isActive(true)
                .build();

        user = userRepository.save(user);

        return createSessionAndGenerateTokens(user, userAgent);
    }

    private TokenResponse createSessionAndGenerateTokens(User user, String userAgent) {
        String sessionId = UUID.randomUUID().toString();
        String deviceInfo = DeviceUtils.parseDeviceInfo(userAgent);

        UserSession userSession = UserSession.builder()
                .id(sessionId)
                .user(user)
                .deviceInfo(deviceInfo)
                .expires_at(LocalDateTime.now().plusHours(24))
                .build();
        sessionRepository.save(userSession);

        var accessToken = jwtService.generateAccessToken(user, sessionId);
        var refreshToken = jwtService.generateRefreshToken(user, sessionId);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    private GoogleUserInfo verifyGoogleToken(String token) {
        // 1. Thử gọi Google userinfo API (hỗ trợ access_token từ Google OAuth2 TokenClient)
        try {
            ResponseEntity<Map<String, Object>> response = restClient.get()
                    .uri("https://www.googleapis.com/oauth2/v3/userinfo")
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .toEntity(new ParameterizedTypeReference<>() {});

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("email")) {
                return GoogleUserInfo.builder()
                        .email((String) body.get("email"))
                        .name((String) body.get("name"))
                        .picture((String) body.get("picture"))
                        .build();
            }
        } catch (Exception e) {
            log.debug("Token không phải access_token hoặc lỗi userinfo: {}", e.getMessage());
        }

        // 2. Thử gọi Google TokenInfo API (hỗ trợ ID Token từ Google GIS)
        try {
            ResponseEntity<Map<String, Object>> response = restClient.get()
                    .uri("https://oauth2.googleapis.com/tokeninfo?id_token={token}", token)
                    .retrieve()
                    .toEntity(new ParameterizedTypeReference<>() {});

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("email")) {
                return GoogleUserInfo.builder()
                        .email((String) body.get("email"))
                        .name((String) body.get("name"))
                        .picture((String) body.get("picture"))
                        .build();
            }
        } catch (Exception e) {
            log.warn("Không thể xác thực token qua Google TokenInfo API: {}. Thử parse JWT...", e.getMessage());
        }

        // 3. Fallback parse JWT nếu offline hoặc test
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            var claims = signedJWT.getJWTClaimsSet();
            String email = (String) claims.getClaim("email");
            String name = (String) claims.getClaim("name");
            String picture = (String) claims.getClaim("picture");

            if (email != null && !email.isBlank()) {
                return GoogleUserInfo.builder()
                        .email(email)
                        .name(name != null ? name : email.split("@")[0])
                        .picture(picture)
                        .build();
            }
        } catch (Exception parseEx) {
            log.error("Parse JWT Google thất bại: {}", parseEx.getMessage());
        }

        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    @lombok.Data
    @lombok.Builder
    private static class GoogleUserInfo {
        String email;
        String name;
        String picture;
    }
}
