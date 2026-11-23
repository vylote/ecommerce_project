package com.vlt.ecommerce.security;

import com.nimbusds.jwt.SignedJWT;
import com.vlt.ecommerce.domain.User;

public interface JwtService {

    String generateAccessToken(User user, String sessionId);

    String generateRefreshToken(User user, String sessionId);

    SignedJWT verifyToken(String token);
}
