package com.vlt.ecommerce.service;

import java.util.List;

import com.vlt.ecommerce.service.dto.request.AddressRequest;
import com.vlt.ecommerce.service.dto.response.AddressResponse;

public interface AddressService {

    AddressResponse create(AddressRequest request);

    List<AddressResponse> getMyAddresses();

    void delete(Long id);

    AddressResponse update(AddressRequest request, Long id);
}
