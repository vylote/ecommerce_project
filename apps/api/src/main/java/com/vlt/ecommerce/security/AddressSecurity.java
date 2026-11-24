package com.vlt.ecommerce.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.vlt.ecommerce.domain.Address;
import com.vlt.ecommerce.repository.AddressRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Component("addressSecurity")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AddressSecurity {
    AddressRepository addressRepository;

    public Boolean isOwner(Long addressId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = (Long) authentication.getDetails();

        Address address = addressRepository.findById(addressId).orElse(null);

        if (address == null) return true;
        return address.getUser().getId().equals(currentUserId);
    }
}
