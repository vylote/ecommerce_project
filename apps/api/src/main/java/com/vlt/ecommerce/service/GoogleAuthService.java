package com.vlt.ecommerce.service;

import com.vlt.ecommerce.service.dto.request.GoogleCompleteRegistrationRequest;
import com.vlt.ecommerce.service.dto.request.GoogleLoginRequest;
import com.vlt.ecommerce.service.dto.response.GoogleAuthResponse;
import com.vlt.ecommerce.service.dto.response.TokenResponse;

public interface GoogleAuthService {

    GoogleAuthResponse authenticateGoogle(GoogleLoginRequest request, String userAgent);

    TokenResponse completeRegistration(GoogleCompleteRegistrationRequest request, String userAgent);
}
