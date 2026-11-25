package com.vlt.ecommerce.security;

import java.io.IOException;
import java.util.Optional;
import java.util.Set;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.vlt.ecommerce.config.Constants;
import com.nimbusds.jwt.SignedJWT;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.integration.redis.TokenBlacklistService;
import com.vlt.ecommerce.integration.redis.UserAuthorizationCache;

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
    UserAuthorizationCache authorizationCache;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Cho qua ngay lập tức đối với preflight request OPTIONS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // Kiểm tra servletPath (bỏ context-path /api/v1) hoặc URI chứa endpoint xác thực
        String servletPath = request.getServletPath();
        String uri = request.getRequestURI();
        if (servletPath.startsWith("/auth/login") || servletPath.startsWith("/auth/register") || servletPath.startsWith("/auth/refresh")
                || servletPath.startsWith("/auth/google") || servletPath.startsWith("/auth/send-email-otp")
                || uri.contains("/auth/login") || uri.contains("/auth/register") || uri.contains("/auth/refresh")
                || uri.contains("/auth/google") || uri.contains("/auth/send-email-otp")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals(Constants.ACCESS_TOKEN_COOKIE)) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token != null) {
            try {
                SignedJWT signedJWT = jwtService.verifyToken(token);

                String ssid = signedJWT.getJWTClaimsSet().getStringClaim(Constants.SESSION_ID_CLAIM);
                String email = signedJWT.getJWTClaimsSet().getSubject();
                Long userId = signedJWT.getJWTClaimsSet().getLongClaim(Constants.USER_ID_CLAIM);

                if (blacklistService.isSsidBlacklisted(ssid)) {
                    log.warn("Chặn truy cập: Phiên đăng nhập {} đã bị thu hồi", ssid);
                    sendErrorResponse(request, response, ErrorCode.UNAUTHENTICATED, "The login session has been revoked.");
                    return;
                }

                // get current role & permission -> read key from redis
                Optional<Set<SimpleGrantedAuthority>> authorities = authorizationCache.resolveAuthorities(userId);
                if (authorities.isEmpty()) {
                    log.warn("Blocked authentication for a missing or inactive account (userId={})", userId);
                    sendErrorResponse(request, response, ErrorCode.USER_LOCKED, ErrorCode.USER_LOCKED.getMessage());
                    return;
                }

                // use list permission getting to create Authentication put in SecurityContext.
                // Spring will use it when remark hasRole or hasAuthority
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email, null, authorities.get());

                authentication.setDetails(userId);
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                log.error("Token JWT không hợp lệ hoặc đã hết hạn cho request {}: {}", uri, e.getMessage());
                sendErrorResponse(request, response, ErrorCode.UNAUTHENTICATED, ErrorCode.UNAUTHENTICATED.getMessage());
                return;
            }
        } else {
            log.debug("Không tìm thấy accessToken cookie trong request: {}", uri);
        }
        
        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletRequest request, HttpServletResponse response, ErrorCode errorCode, String customMessage)
            throws IOException {
        String origin = request.getHeader(HttpHeaders.ORIGIN);
        if (StringUtils.hasText(origin)) {
            response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
            response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
            response.setHeader("Access-Control-Allow-Headers", "*");
        }
        response.setStatus(errorCode.getStatusCode().value());
        response.setContentType("application/json;charset=UTF-8");
        String jsonResponse = String.format(
                "{\"code\": %d, \"message\": \"%s\"}",
                errorCode.getCode(),
                customMessage);
        response.getWriter().write(jsonResponse);
    }
}
