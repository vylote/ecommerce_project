package com.vlt.ecommerce.feature.shop;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.dto.response.ProductResponse;
import com.vlt.ecommerce.feature.product.mapper.ProductMapper;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;
import com.vlt.ecommerce.feature.shop.dto.request.ShopRequest;
import com.vlt.ecommerce.feature.shop.dto.response.ShopResponse;
import com.vlt.ecommerce.feature.shop.mapper.ShopMapper;
import com.vlt.ecommerce.feature.shop.repository.ShopRepository;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.UserRepository;

import jakarta.transaction.Transactional;
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
    UserRepository userRepository;
    ProductRepository productRepository;
    ShopMapper shopMapper;
    ProductMapper productMapper;

    @Transactional // tối ưu đường truyền, k phải nhằm mục đích lazy loading
    public ShopResponse create(ShopRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User seller =  userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (shopRepository.existsBySellerId(seller.getId())) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED);
        }

        Shop newShop = shopMapper.tShop(request);
        newShop.setSeller(seller);

        return shopMapper.toShopResponse(shopRepository.save(newShop));
    }

    @Transactional //giữ mạng gọi proxy - note trong model
    public ShopResponse update(ShopRequest request, Long id) {
        Shop shop = shopRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        if (!shop.getSeller().getEmail().equals(email)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        shopMapper.updateShopFromRequest(request, shop);
        return shopMapper.toShopResponse(shop);
    }

    public ShopResponse get(Long id) {
        Shop shop = shopRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        return shopMapper.toShopResponse(shop);
    }

    public List<ProductResponse> getProductsShop(Long shopId) {
        if (!shopRepository.existsById(shopId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        List<Product> products = productRepository.findByShopId(shopId);
        
        return productMapper.toProductsShopResponse(products);
    }
}
