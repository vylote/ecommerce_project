package com.vlt.ecommerce.service;

import com.vlt.ecommerce.service.dto.request.LoginRequest;
import com.vlt.ecommerce.service.dto.request.RegisterRequest;
import com.vlt.ecommerce.service.dto.request.SendOtpRequest;
import com.vlt.ecommerce.service.dto.response.TokenResponse;
import com.vlt.ecommerce.service.dto.response.UserResponse;

public interface AuthService {

    void sendEmailOtp(SendOtpRequest request);

    UserResponse register(RegisterRequest request);

    TokenResponse login(LoginRequest request, String userAgent);

    TokenResponse refreshToken(String refreshToken);

    UserResponse getMyInfo();

    void logout(String accessToken);
}
