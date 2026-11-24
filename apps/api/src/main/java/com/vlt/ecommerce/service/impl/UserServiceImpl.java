package com.vlt.ecommerce.service.impl;

import java.io.IOException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.vlt.ecommerce.integration.redis.UserAuthorizationCache;
import com.vlt.ecommerce.service.UserService;
import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.integration.cloudinary.ImageStorageService;
import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.service.dto.request.UpdateProfileRequest;
import com.vlt.ecommerce.service.dto.response.UserResponse;
import com.vlt.ecommerce.service.mapper.UserMapper;
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
public class UserServiceImpl implements UserService {
    CurrentUserProvider currentUserProvider;
    UserRepository userRepository;
    UserAuthorizationCache authorizationCache;
    UserMapper userMapper;
    ImageStorageService imageStorageService;

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<UserResponse> getAllUsers(
        String email, String fullName, String phone, int page, int size, String sortBy, String order) {
        Sort sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page - 1, size, sort);

        Page<User> userPage = userRepository.filterUsers(email, fullName, phone, pageable);
        List<UserResponse> content = userMapper.toUserResponses(userPage.getContent());
        return PageResponse.of(userPage, content);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getDetailUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateMyProfile(UpdateProfileRequest request, MultipartFile file) {
        User user = currentUserProvider.getUser();

        String oldAvatarUrl = user.getAvatarUrl();

        userMapper.updateUserProfile(request, user);
        try {
            if (file != null && !file.isEmpty()) {
                String secureUrl = imageStorageService.uploadFile(file, "ecommerce/users");
                imageStorageService.deleteByUrl(oldAvatarUrl);
                user.setAvatarUrl(secureUrl);
            }
        } catch (IOException e) {
            throw new AppException(ErrorCode.IMAGE_UPLOAD_FAILED);
        }

        return userMapper.toUserResponse(user);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserResponse updateUserStatus(Long id) {
        authorizationCache.userChanged(id);
        User user = userRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String currentAdminEmail = currentUserProvider.getEmail();
        if (user.getEmail().equals(currentAdminEmail)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        user.setIsActive(!user.getIsActive());
        return userMapper.toUserResponse(user);
    }
}
