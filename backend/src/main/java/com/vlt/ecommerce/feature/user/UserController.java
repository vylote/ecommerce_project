package com.vlt.ecommerce.feature.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.common.dto.PageResponse;
import com.vlt.ecommerce.feature.user.dto.request.UpdateProfileRequest;
import com.vlt.ecommerce.feature.user.dto.response.UserResponse;
import com.vlt.ecommerce.feature.user.service.UserService;

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

    @PutMapping("/profile")
    public ApiResponse<UserResponse> updateMyProfile(@RequestBody UpdateProfileRequest request) {
        return ApiResponse.<UserResponse>builder()
            .result(userService.updateMyProfile(request))
            .build();
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<UserResponse> updateUserStatus(@PathVariable Long id) {
        return ApiResponse.<UserResponse>builder()
            .result(userService.updateUserStatus(id))
            .build();
    }
}
