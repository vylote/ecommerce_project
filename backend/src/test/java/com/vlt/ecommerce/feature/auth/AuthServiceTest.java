package com.vlt.ecommerce.feature.auth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.auth.dto.request.LoginRequest;
import com.vlt.ecommerce.feature.auth.dto.request.RegisterRequest;
import com.vlt.ecommerce.feature.auth.dto.response.TokenResponse;
import com.vlt.ecommerce.feature.user.Role;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.dto.response.UserResponse;
import com.vlt.ecommerce.feature.user.mapper.UserMapper;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@ExtendWith(MockitoExtension.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
class AuthServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    JwtService jwtService;

    @Mock
    UserMapper userMapper;

    @InjectMocks
    AuthService authService;

    RegisterRequest registerRequest;
    LoginRequest loginRequest;
    User mockUser;
    UserResponse userResponse;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@gmail.com");
        registerRequest.setPassword("123456");
        registerRequest.setFullName("Test User");
        registerRequest.setPhone("0123456789");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@gmail.com");
        loginRequest.setPassword("123456");

        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@gmail.com");
        mockUser.setPassword("encodedPassword");
        mockUser.setFullName("Test User");
        mockUser.setPhone("0123456789");
        mockUser.setRole(Role.BUYER);
        mockUser.setIsActive(true);

        userResponse = new UserResponse();
        userResponse.setEmail("test@gmail.com");
        userResponse.setFullName("Test User");
        userResponse.setPhone("0123456789");
        userResponse.setRole(Role.BUYER);
        userResponse.setIsActive(true);
    }

    @Test
    void register_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userMapper.toUser(any(RegisterRequest.class))).thenReturn(mockUser);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(userMapper.toUserResponse(any(User.class))).thenReturn(userResponse);

        UserResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals(registerRequest.getEmail(), response.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_Fail_EmailExisted() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> authService.register(registerRequest));

        assertEquals(ErrorCode.RESOURCE_EXISTED, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("mockJwtToken");

        TokenResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getAccessToken());
        verify(jwtService, times(1)).generateAccessToken(any(User.class));
    }
    @Test
    void login_Fail_WrongPassword() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);
        
        AppException exception = assertThrows(AppException.class, () -> authService.login(loginRequest));
        assertEquals(ErrorCode.UNAUTHENTICATED, exception.getErrorCode());
        verify(jwtService, never()).generateAccessToken(any(User.class));
    }
}