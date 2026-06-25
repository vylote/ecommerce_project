package com.vlt.ecommerce.feature.user.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.dto.PageResponse;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.dto.request.UpdateProfileRequest;
import com.vlt.ecommerce.feature.user.dto.response.UserResponse;
import com.vlt.ecommerce.feature.user.mapper.UserMapper;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;

    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<UserResponse> getAllUsers(
        String email, String fullName, String phone, int page, int size, String sortBy, String order) {
        Sort sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        
        // page - 1: Để Frontend được truyền page=1 cho tự nhiên
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        Page<User> userPage = userRepository.filterUsers(email, fullName, phone, pageable);
        List<UserResponse> content = userMapper.toUserResponses(userPage.getContent());
        return PageResponse.of(userPage, content);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getDetailUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        return userMapper.toUserResponse(user);
    }

    @Transactional 
    public UserResponse updateMyProfile(UpdateProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        userMapper.updateUserProfile(request, user);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserResponse updateUserStatus(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        String currentAdminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (user.getEmail().equals(currentAdminEmail)) {
            throw new AppException(ErrorCode.UNAUTHORIZED); 
        }

        user.setIsActive(!user.getIsActive());
        return userMapper.toUserResponse(userRepository.save(user));
    } 
}
