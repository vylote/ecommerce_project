package com.vlt.ecommerce.feature.shop;

import org.springframework.stereotype.Service;

import com.vlt.ecommerce.feature.shop.dto.request.ShopRequest;
import com.vlt.ecommerce.feature.shop.dto.response.ShopResponse;
import com.vlt.ecommerce.feature.shop.repository.ShopRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ShopService {
    ShopRepository shopRepository;

    
}
