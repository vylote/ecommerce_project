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

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    JwtService jwtService;
    TokenBlacklistService blacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // 1. Bỏ qua các endpoint không cần bảo mật (như login, register, refresh)
        // Nếu không bỏ qua, lúc User chưa có token mà gọi Login sẽ bị chặn oan
        String path = request.getRequestURI();
        if (path.startsWith("/auth/login") || path.startsWith("/auth/register") || path.startsWith("/auth/refresh")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Lấy Access Token từ Cookie
        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals("accessToken")) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // 3. Nếu có Token, tiến hành mổ xẻ và xác thực
        if (token != null) {
            try {
                // Sử dụng hàm verifyToken của bạn (nếu lỗi, nó sẽ throw AppException và nhảy xuống catch)
                SignedJWT signedJWT = jwtService.verifyToken(token);

                // Lấy thông tin từ Payload
                String ssid = signedJWT.getJWTClaimsSet().getStringClaim("sessionId");
                String email = signedJWT.getJWTClaimsSet().getSubject();
                Long userId = signedJWT.getJWTClaimsSet().getLongClaim("userId");

                List<String> roles = signedJWT.getJWTClaimsSet().getStringListClaim("roles");
                List<String> permissions = signedJWT.getJWTClaimsSet().getStringListClaim("permissions");

                // KIỂM TRA LỆNH TRUY NÃ TỪ REDIS
                if (blacklistService.isSsidBlacklisted(ssid)) {
                    sendErrorResponse(response, ErrorCode.UNAUTHENTICATED, "Phiên đăng nhập đã bị thu hồi từ xa.");
                    return;
                }

                // Nếu mọi thứ an toàn, cấp "thẻ hành nghề" cho User đi qua
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                if (roles != null) {
                    authorities.addAll(roles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList()));
                }

                // Đổ mảng Permissions vào (Spring Security dùng các chuỗi này cho hàm hasAuthority())
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
                // Bắt mọi lỗi từ token (hết hạn, sai chữ ký, v.v.)
                sendErrorResponse(response, ErrorCode.UNAUTHENTICATED, ErrorCode.UNAUTHENTICATED.getMessage());
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, ErrorCode errorCode, String customMessage) throws IOException {
        response.setStatus(errorCode.getStatusCode().value());
        response.setContentType("application/json;charset=UTF-8");
        // Giả lập cấu trúc ApiResponse của bạn
        String jsonResponse = String.format(
            "{\"code\": %d, \"message\": \"%s\"}", 
            errorCode.getCode(), 
            customMessage
        );
        response.getWriter().write(jsonResponse);
    }
}
