package com.vlt.ecommerce.service.impl;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.vlt.ecommerce.integration.redis.UserAuthorizationCache;
import com.vlt.ecommerce.domain.Shop;
import com.vlt.ecommerce.service.ShopService;
import com.vlt.ecommerce.config.Constants;
import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;
import com.vlt.ecommerce.integration.cloudinary.ImageStorageService;
import com.vlt.ecommerce.domain.Category;
import com.vlt.ecommerce.domain.Product;
import com.vlt.ecommerce.service.dto.response.ProductResponse;
import com.vlt.ecommerce.service.mapper.ProductMapper;
import com.vlt.ecommerce.repository.CategoryRepository;
import com.vlt.ecommerce.repository.ProductRepository;
import com.vlt.ecommerce.service.dto.request.ShopRequest;
import com.vlt.ecommerce.service.dto.response.ShopResponse;
import com.vlt.ecommerce.service.mapper.ShopMapper;
import com.vlt.ecommerce.repository.ShopRepository;
import com.vlt.ecommerce.domain.Role;
import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.repository.RoleRepository;

import com.vlt.ecommerce.security.CurrentUserProvider;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ShopServiceImpl implements ShopService {
    CurrentUserProvider currentUserProvider;
    ShopRepository shopRepository;
    ProductRepository productRepository;
    RoleRepository roleRepository;
    UserAuthorizationCache authorizationCache;
    CategoryRepository categoryRepository;
    ShopMapper shopMapper;
    ProductMapper productMapper;

    ImageStorageService imageStorageService;

    @Override
    @Transactional
    public ShopResponse create(ShopRequest request, MultipartFile file) {
        authorizationCache.userChanged(currentUserProvider.getUserId());
        User seller = currentUserProvider.getUser();

        boolean isAlreadySeller = seller.getRoles().stream()
                .anyMatch(r -> r.getName().equals(Constants.ROLE_SELLER));

        if (isAlreadySeller) {
            throw new AppException(ErrorCode.SHOP_ALREADY_EXISTS);
        }

        Role sellerRole = roleRepository.findByName(Constants.ROLE_SELLER)
                .orElseThrow(() -> new AppException(ErrorCode.DEFAULT_ROLE_NOT_CONFIGURED));
        seller.getRoles().add(sellerRole);

        Set<Category> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));

        Shop newShop = shopMapper.tShop(request);
        newShop.setSeller(seller);
        newShop.setCategories(categories);

        try {
            if (file != null && !file.isEmpty()) {
                String secureUrl = imageStorageService.uploadFile(file, "ecommerce/shops");
                newShop.setLogoUrl(secureUrl);
            }
        } catch (IOException e) {
            log.error("Error uploading shop logo", e);
        }

        return shopMapper.toShopResponse(shopRepository.save(newShop));
    }

    @Override
    @Transactional
    public ShopResponse update(ShopRequest request, Long id, MultipartFile file) {
        Shop shop = shopRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHOP_NOT_FOUND));

        String email = currentUserProvider.getEmail();
        if (!shop.getSeller().getEmail().equals(email)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String oldLogoUrl = shop.getLogoUrl();

        shopMapper.updateShopFromRequest(request, shop);

        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
            shop.setCategories(categories);
        }

        try {
            if (file != null && !file.isEmpty()) {
                String secureUrl = imageStorageService.uploadFile(file, "ecommerce/shops");
                imageStorageService.deleteByUrl(oldLogoUrl);
                shop.setLogoUrl(secureUrl);
            }
        } catch (IOException e) {
            log.error("Error uploading shop logo", e);
        }

        return shopMapper.toShopResponse(shop);
    }

    @Override
    public ShopResponse get(Long id) {
        Shop shop = shopRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHOP_NOT_FOUND));

        ShopResponse response = shopMapper.toShopResponse(shop);
        response.setSellerEmail(null);
        response.setSellerPhone(null);
        return response;
    }

    @Override
    public ShopResponse getMyShop() {
        User seller = currentUserProvider.getUser();

        Shop shop = shopRepository.findBySellerId(seller.getId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOP_NOT_FOUND));

        return shopMapper.toShopResponse(shop);
    }

    @Override
    public List<ProductResponse> getProductsShop(Long shopId) {
        if (!shopRepository.existsById(shopId)) {
            throw new AppException(ErrorCode.SHOP_NOT_FOUND);
        }

        List<Product> products = productRepository.findByShopId(shopId);

        return productMapper.toProductResponseList(products);
    }

    @Override
    @Transactional
    public void updateShopRating(Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new AppException(ErrorCode.SHOP_NOT_FOUND));

        Double avgRating = productRepository.getAverageRatingByShopId(shopId);
        shop.setRating(avgRating != null ? avgRating : 0.0);
    }

    @Override
    @Transactional
    public PageResponse<ShopResponse> searchShops(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("rating").descending());
        Page<Shop> shopPage = shopRepository.searchShopsByKeyword(keyword, pageable);
        List<ShopResponse> content = shopMapper.toShopResponses(shopPage.getContent());
        return PageResponse.of(shopPage, content);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ShopResponse> getShopsForAdmin(String keyword, Boolean isActive, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        String kw = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        Page<Shop> shopPage = shopRepository.findShopsForAdmin(kw, isActive, pageable);
        List<ShopResponse> content = shopMapper.toShopResponses(shopPage.getContent());
        return PageResponse.of(shopPage, content);
    }

    @Override
    @Transactional
    public ShopResponse toggleShopStatus(Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new AppException(ErrorCode.SHOP_NOT_FOUND));

        shop.setIsActive(!Boolean.TRUE.equals(shop.getIsActive()));
        return shopMapper.toShopResponse(shopRepository.save(shop));
    }

    @Override
    public Map<String, Long> getShopStatsForAdmin() {
        long total = shopRepository.count();
        long active = shopRepository.countByIsActive(true);
        long locked = shopRepository.countByIsActive(false);

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("active", active);
        stats.put("locked", locked);
        return stats;
    }
}
