package com.vlt.ecommerce.service;

import org.springframework.web.multipart.MultipartFile;

import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.service.dto.request.UpdateProfileRequest;
import com.vlt.ecommerce.service.dto.response.UserResponse;

public interface UserService {

    PageResponse<UserResponse> getAllUsers(
        String email, String fullName, String phone, int page, int size, String sortBy, String order);

    UserResponse getDetailUser(Long id);

    UserResponse updateMyProfile(UpdateProfileRequest request, MultipartFile file);

    UserResponse updateUserStatus(Long id);
}
