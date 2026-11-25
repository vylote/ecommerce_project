package com.vlt.ecommerce.security;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.repository.UserRepository;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public User getUser() {
        return userRepository.findByEmail(getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    public String getEmail() {
        return requireAuthentication().getName();
    }

    public Long getUserId() {
        if (requireAuthentication().getDetails() instanceof Long userId) {
            return userId;
        }
        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    public boolean hasAuthority(String authority) {
        return requireAuthentication().getAuthorities().stream()
                .anyMatch(granted -> authority.equals(granted.getAuthority()));
    }

    private Authentication requireAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return authentication;
    }
}
