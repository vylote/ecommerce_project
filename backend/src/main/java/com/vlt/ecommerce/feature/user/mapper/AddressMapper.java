package com.vlt.ecommerce.feature.user.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.vlt.ecommerce.feature.user.Address;
import com.vlt.ecommerce.feature.user.dto.request.AddressRequest;
import com.vlt.ecommerce.feature.user.dto.response.AddressResponse;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    Address toAddress(AddressRequest request);

    @Mapping(target = "userId", source = "user.id")
    AddressResponse toAddressResponse(Address address);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    void updateAddress(AddressRequest request, @MappingTarget Address address);
}
