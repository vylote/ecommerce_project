package com.vlt.ecommerce.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.nimbusds.jwt.SignedJWT;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.common.security.TokenBlacklistService;
import com.vlt.ecommerce.feature.auth.JwtService;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    JwtService jwtService;
    TokenBlacklistService blacklistService;
    UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path.startsWith("/auth/login") || path.startsWith("/auth/register") || path.startsWith("/auth/refresh")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals("accessToken")) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token != null) {
            try {
                SignedJWT signedJWT = jwtService.verifyToken(token);

                String ssid = signedJWT.getJWTClaimsSet().getStringClaim("sessionId");
                String email = signedJWT.getJWTClaimsSet().getSubject();
                Long userId = signedJWT.getJWTClaimsSet().getLongClaim("userId");

                List<String> roles = signedJWT.getJWTClaimsSet().getStringListClaim("roles");
                List<String> permissions = signedJWT.getJWTClaimsSet().getStringListClaim("permissions");

                if (blacklistService.isSsidBlacklisted(ssid)) {
                    log.warn("Chặn truy cập: Phiên đăng nhập {} đã bị thu hồi", ssid);
                    sendErrorResponse(response, ErrorCode.UNAUTHENTICATED, "Phiên đăng nhập đã bị thu hồi từ xa.");
                    return;
                }

                User user = userRepository.findById(userId).orElse(null);
                if (user == null || Boolean.FALSE.equals(user.getIsActive())) {
                    log.warn("Chặn truy cập: User bị khóa hoặc không tồn tại. UserId: {}", userId);
                    sendErrorResponse(response, ErrorCode.USER_LOCKED, ErrorCode.USER_LOCKED.getMessage());
                    return;
                }

                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                if (roles != null) {
                    authorities.addAll(roles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList()));
                }

                if (permissions != null) {
                    authorities.addAll(permissions.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList()));
                }
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email, null, authorities);

                authentication.setDetails(userId);
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                log.error("Token JWT không hợp lệ hoặc đã hết hạn cho request {}: {}", path, e.getMessage());
                sendErrorResponse(response, ErrorCode.UNAUTHENTICATED, ErrorCode.UNAUTHENTICATED.getMessage());
                return;
            }
        } else {
            log.debug("Không tìm thấy accessToken cookie trong request: {}", path);
        }
        
        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, ErrorCode errorCode, String customMessage)
            throws IOException {
        response.setStatus(errorCode.getStatusCode().value());
        response.setContentType("application/json;charset=UTF-8");
        String jsonResponse = String.format(
                "{\"code\": %d, \"message\": \"%s\"}",
                errorCode.getCode(),
                customMessage);
        response.getWriter().write(jsonResponse);
    }
}
