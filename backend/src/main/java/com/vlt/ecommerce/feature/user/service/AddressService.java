package com.vlt.ecommerce.feature.user.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.user.Address;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.dto.request.AddressRequest;
import com.vlt.ecommerce.feature.user.dto.response.AddressResponse;
import com.vlt.ecommerce.feature.user.mapper.AddressMapper;
import com.vlt.ecommerce.feature.user.repository.AddressRepository;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AddressService {
    AddressRepository addressRepository;
    AddressMapper addressMapper;
    UserRepository userRepository;

    @PreAuthorize("hasRole('BUYER')")
    public AddressResponse create(AddressRequest request) {
        User user = getCurrentUser();

        var newAddress = addressMapper.toAddress(request);
        newAddress.setUser(user);

        List<Address> existingAddresses = addressRepository.findByUserId(user.getId());

        if (existingAddresses.isEmpty()) {
            newAddress.setIsDefault(true);
        } else if (Boolean.TRUE.equals(request.getIsDefault())) {
            resetDefaultAddress(existingAddresses);
            newAddress.setIsDefault(true);
        } else newAddress.setIsDefault(false);

        return addressMapper.toAddressResponse(addressRepository.save(newAddress));
    }

    @Transactional
    @PreAuthorize("hasRole('BUYER')")
    public List<AddressResponse> getMyAddresses() {
        User currentUser = getCurrentUser();
        return addressRepository.findByUserId(currentUser.getId()).stream()
                .map(addressMapper::toAddressResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @PreAuthorize("hasRole('BUYER') and @addressSecurity.isOwner(#id)")
    public void delete(Long id) {
        addressRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        addressRepository.deleteById(id);
    }

    @Transactional
    @PreAuthorize("hasRole('BUYER') and @addressSecurity.isOwner(#id)")
    public AddressResponse update(AddressRequest request, Long id) {
        Address currentAddress = addressRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (Boolean.TRUE.equals(request.getIsDefault()) && !currentAddress.getIsDefault()) {
            List<Address> existingAddresses = addressRepository.findByUserId(currentAddress.getUser().getId());
            resetDefaultAddress(existingAddresses);
        }

        addressMapper.updateAddress(request, currentAddress);
        return addressMapper.toAddressResponse(currentAddress);
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    @Transactional
    public void resetDefaultAddress(List<Address> addresses) {
        for (Address addr : addresses) {
            if (addr.getIsDefault()) {
                addr.setIsDefault(false);
            }
        }
    }
}
