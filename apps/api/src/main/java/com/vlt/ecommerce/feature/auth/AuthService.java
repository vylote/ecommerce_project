package com.vlt.ecommerce.feature.auth;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.nimbusds.jwt.SignedJWT;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.common.utils.DeviceUtils;
import com.vlt.ecommerce.feature.auth.dto.request.LoginRequest;
import com.vlt.ecommerce.feature.auth.dto.request.RegisterRequest;
import com.vlt.ecommerce.feature.auth.dto.response.TokenResponse;
import com.vlt.ecommerce.feature.user.Role;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.UserSession;
import com.vlt.ecommerce.feature.user.dto.response.UserResponse;
import com.vlt.ecommerce.feature.user.mapper.UserMapper;
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
public class AuthService {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    JwtService jwtService;
    UserMapper userMapper;
    SessionRepository sessionRepository;
    RoleRepository roleRepository;
    SessionService sessionService;
    org.springframework.data.redis.core.StringRedisTemplate redisTemplate;
    com.vlt.ecommerce.common.mail.EmailService emailService;

    public void sendEmailOtp(com.vlt.ecommerce.feature.auth.dto.request.SendOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        // Sinh mã OTP 6 chữ số ngẫu nhiên
        String otp = String.format("%06d", new java.security.SecureRandom().nextInt(1_000_000));

        // Lưu vào Redis với TTL 5 phút
        String redisKey = "EMAIL_OTP:" + email;
        redisTemplate.opsForValue().set(redisKey, otp, 5, java.util.concurrent.TimeUnit.MINUTES);

        // Gửi email OTP
        emailService.sendOtpEmail(email, otp);
    }

    public UserResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ErrorCode.PHONE_EXISTED);
        }

        // Xác thực mã OTP từ Redis
        String redisKey = "EMAIL_OTP:" + email;
        String cachedOtp = redisTemplate.opsForValue().get(redisKey);
        if (cachedOtp == null || !cachedOtp.equals(request.getOtp().trim())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        // Đã xác thực thành công -> Xóa OTP khỏi Redis
        redisTemplate.delete(redisKey);

        Role buyerRole = roleRepository.findByName("ROLE_BUYER")
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        User user = userMapper.toUser(request);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone().trim());
        user.setRoles(new HashSet<>(Collections.singletonList(buyerRole)));
        user.setIsActive(true);

        return userMapper.toUserResponse(userRepository.save(user));
    }
    
    public TokenResponse login(LoginRequest request, String userAgent) {
        String identifier = request.getEmail().trim();
        var user = userRepository.findByEmailOrPhone(identifier, identifier)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new AppException(ErrorCode.USER_LOCKED);
        }

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

    public TokenResponse refreshToken(String refreshToken) {
        try {
            SignedJWT signedJWT = jwtService.verifyToken(refreshToken);
            String email = signedJWT.getJWTClaimsSet().getSubject();
            String sessionId = signedJWT.getJWTClaimsSet().getStringClaim("sessionId");

            if (!sessionRepository.existsById(sessionId))
                throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);

            var user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

            var accessToken = jwtService.generateAccessToken(user, sessionId);
            var newRefreshToken = jwtService.generateRefreshToken(user, sessionId);

            return TokenResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(newRefreshToken)
                    .build();
        } catch (ParseException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    public UserResponse getMyInfo() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        return userMapper.toUserResponse(user);
    }

    public void logout(String accessToken) {
        if (StringUtils.hasText(accessToken)) {
            try {
                SignedJWT signedJWT = SignedJWT.parse(accessToken);
                String ssid = signedJWT.getJWTClaimsSet().getStringClaim("sessionId");
                
                if (ssid != null) {
                    sessionService.revokeSession(ssid);
                }
            } catch (Exception e) {
                log.warn("Lỗi parse token khi đăng xuất (có thể token đã hỏng hoặc bị can thiệp): {}", e.getMessage());
            }
        }
    }
}
