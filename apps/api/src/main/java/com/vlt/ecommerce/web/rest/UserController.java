package com.vlt.ecommerce.web.rest;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.vlt.ecommerce.service.dto.response.ApiResponse;
import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.service.dto.request.UpdateProfileRequest;
import com.vlt.ecommerce.service.dto.response.UserResponse;
import com.vlt.ecommerce.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/users")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class UserController {
    UserService userService;

    @GetMapping
    public ApiResponse<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String phone,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {
        
        return ApiResponse.<PageResponse<UserResponse>>builder()
            .result(userService.getAllUsers(email, fullName, phone, page, size, sortBy, order))
            .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getDetailUser(@PathVariable Long id) {
        return ApiResponse.<UserResponse>builder()
            .result(userService.getDetailUser(id))
            .build();
    }

    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserResponse> updateMyProfile(
            @RequestPart(value = "request", required = false) UpdateProfileRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ApiResponse.<UserResponse>builder()
            .result(userService.updateMyProfile(request, file))
            .build();
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<UserResponse> updateUserStatus(@PathVariable Long id) {
        return ApiResponse.<UserResponse>builder()
            .result(userService.updateUserStatus(id))
            .build();
    }
}
