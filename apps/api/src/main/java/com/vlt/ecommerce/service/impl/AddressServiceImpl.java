package com.vlt.ecommerce.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.vlt.ecommerce.service.AddressService;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.domain.Address;
import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.service.dto.request.AddressRequest;
import com.vlt.ecommerce.service.dto.response.AddressResponse;
import com.vlt.ecommerce.service.mapper.AddressMapper;
import com.vlt.ecommerce.repository.AddressRepository;

import jakarta.transaction.Transactional;
import com.vlt.ecommerce.security.CurrentUserProvider;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {
    CurrentUserProvider currentUserProvider;
    AddressRepository addressRepository;
    AddressMapper addressMapper;

    @Override
    public AddressResponse create(AddressRequest request) {
        User user = currentUserProvider.getUser();

        Address newAddress = addressMapper.toAddress(request);
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

    @Override
    @Transactional
    public List<AddressResponse> getMyAddresses() {
        User currentUser = currentUserProvider.getUser();
        return addressRepository.findByUserId(currentUser.getId()).stream()
                .map(addressMapper::toAddressResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        addressRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        addressRepository.deleteById(id);
    }

    @Override
    @Transactional
    public AddressResponse update(AddressRequest request, Long id) {
        Address currentAddress = addressRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        if (Boolean.TRUE.equals(request.getIsDefault()) && !currentAddress.getIsDefault()) {
            List<Address> existingAddresses = addressRepository.findByUserId(currentAddress.getUser().getId());
            resetDefaultAddress(existingAddresses);
        }

        addressMapper.updateAddress(request, currentAddress);
        return addressMapper.toAddressResponse(currentAddress);
    }

    private void resetDefaultAddress(List<Address> addresses) {
        for (Address addr : addresses) {
            if (addr.getIsDefault()) {
                addr.setIsDefault(false);
            }
        }
    }
}
