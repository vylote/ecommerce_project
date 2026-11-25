package com.vlt.ecommerce.service.impl;

import java.security.SecureRandom;
import java.text.ParseException;
import java.util.Collections;
import java.util.HashSet;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.vlt.ecommerce.security.JwtService;
import com.vlt.ecommerce.service.AuthService;
import com.vlt.ecommerce.service.SessionService;
import com.vlt.ecommerce.config.Constants;
import com.nimbusds.jwt.SignedJWT;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.integration.mail.EmailService;
import com.vlt.ecommerce.service.dto.request.LoginRequest;
import com.vlt.ecommerce.service.dto.request.RegisterRequest;
import com.vlt.ecommerce.service.dto.request.SendOtpRequest;
import com.vlt.ecommerce.service.dto.response.TokenResponse;
import com.vlt.ecommerce.domain.Role;
import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.service.dto.response.UserResponse;
import com.vlt.ecommerce.service.mapper.UserMapper;
import com.vlt.ecommerce.repository.RoleRepository;
import com.vlt.ecommerce.repository.UserRepository;

import com.vlt.ecommerce.security.CurrentUserProvider;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    CurrentUserProvider currentUserProvider;
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    JwtService jwtService;
    UserMapper userMapper;
    RoleRepository roleRepository;
    SessionService sessionService;
    StringRedisTemplate redisTemplate;
    EmailService emailService;

    @Override
    public void sendEmailOtp(SendOtpRequest request) {
        String email = request.getEmail();

        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));

        emailService.sendOtpEmail(email, otp);

        String redisKey = Constants.EMAIL_OTP_KEY_PREFIX + email;
        redisTemplate.opsForValue().set(redisKey, otp, Constants.EMAIL_OTP_TTL);
    }

    @Override
    public UserResponse register(RegisterRequest request) {
        String email = request.getEmail();

        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ErrorCode.PHONE_EXISTED);
        }

        String redisKey = Constants.EMAIL_OTP_KEY_PREFIX + email;
        String cachedOtp = redisTemplate.opsForValue().get(redisKey);
        if (cachedOtp == null || !cachedOtp.equals(request.getOtp().trim())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        redisTemplate.delete(redisKey);

        Role buyerRole = roleRepository.getRequiredSystemRole(Constants.ROLE_BUYER);

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(new HashSet<>(Collections.singletonList(buyerRole)));
        user.setIsActive(true);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    public TokenResponse login(LoginRequest request, String userAgent) {
        String identifier = request.getIdentifier();

        User user = userRepository.findByEmailOrPhone(identifier, identifier)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new AppException(ErrorCode.USER_LOCKED);
        }

        return sessionService.createSessionAndGenerateTokens(user, userAgent);
    }

    @Override
    public TokenResponse refreshToken(String refreshToken) {
        try {
            SignedJWT signedJWT = jwtService.verifyToken(refreshToken);
            String email = signedJWT.getJWTClaimsSet().getSubject();
            String sessionId = signedJWT.getJWTClaimsSet().getStringClaim(Constants.SESSION_ID_CLAIM);

            if (!StringUtils.hasText(sessionId)
                    || signedJWT.getJWTClaimsSet().getClaim(Constants.USER_ID_CLAIM) != null) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            return sessionService.refreshSession(user, sessionId);
        } catch (ParseException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    @Override
    public UserResponse getMyInfo() {
        User user = currentUserProvider.getUser();

        return userMapper.toUserResponse(user);
    }

    @Override
    public void logout(String accessToken) {
        if (StringUtils.hasText(accessToken)) {
            try {
                SignedJWT signedJWT = jwtService.verifyToken(accessToken);
                String ssid = signedJWT.getJWTClaimsSet().getStringClaim(Constants.SESSION_ID_CLAIM);

                if (ssid != null) {
                    sessionService.revokeSession(ssid);
                }
            } catch (Exception e) {
                log.warn("Lỗi parse token khi đăng xuất (có thể token đã hỏng hoặc bị can thiệp): {}", e.getMessage());
            }
        }
    }
}
