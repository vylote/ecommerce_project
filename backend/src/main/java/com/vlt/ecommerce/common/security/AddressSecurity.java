package com.vlt.ecommerce.common.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.vlt.ecommerce.feature.user.Address;
import com.vlt.ecommerce.feature.user.repository.AddressRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Component("addressSecurity") // Tên bean để gọi trong @PreAuthorize
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AddressSecurity {
    AddressRepository addressRepository;

    public Boolean isOwner(Long addressId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = (Long) authentication.getDetails();

        Address address = addressRepository.findById(addressId).orElse(null);

        // Trả về true để cho đi tiếp (Lỗi Not Found sẽ do Service lo)
        if (address == null) return true;
        return address.getUser().getId().equals(currentUserId);
    }
}
