package com.vlt.ecommerce.feature.user.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vlt.ecommerce.feature.user.Address;

public interface AddressRepository extends JpaRepository<Address, Long>{
    List<Address> findByUserId(Long userId);
}
