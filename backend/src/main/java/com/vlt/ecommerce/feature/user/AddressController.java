package com.vlt.ecommerce.feature.user;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vlt.ecommerce.common.dto.ApiResponse;
import com.vlt.ecommerce.feature.user.dto.request.AddressRequest;
import com.vlt.ecommerce.feature.user.dto.response.AddressResponse;
import com.vlt.ecommerce.feature.user.service.AddressService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/addresses")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class AddressController {
    AddressService addressService;
    
    @PostMapping
    public ApiResponse<AddressResponse> create(@RequestBody @Valid AddressRequest request) {
        return ApiResponse.<AddressResponse>builder()
            .result(addressService.create(request))
            .build();
    }
    @PutMapping("/{id}")
    public ApiResponse<AddressResponse> update(@RequestBody @Valid AddressRequest request, @PathVariable Long id) {
        return ApiResponse.<AddressResponse>builder()
            .result(addressService.update(request, id))
            .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        addressService.delete(id);
        return ApiResponse.<String>builder()
            .result("Xoa thanh cong dia chi")
            .build();
    }
}
