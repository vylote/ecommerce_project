package com.vlt.ecommerce.feature.shop;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.dto.PageResponse;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.product.Category;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.dto.response.ProductResponse;
import com.vlt.ecommerce.feature.product.mapper.ProductMapper;
import com.vlt.ecommerce.feature.product.repository.CategoryRepository;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;
import com.vlt.ecommerce.feature.shop.dto.request.ShopRequest;
import com.vlt.ecommerce.feature.shop.dto.response.ShopResponse;
import com.vlt.ecommerce.feature.shop.mapper.ShopMapper;
import com.vlt.ecommerce.feature.shop.repository.ShopRepository;
import com.vlt.ecommerce.feature.user.Role;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.repository.RoleRepository;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

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
    RoleRepository roleRepository;
    CategoryRepository categoryRepository;
    ShopMapper shopMapper;
    ProductMapper productMapper;

    @Transactional // tối ưu đường truyền, k phải nhằm mục đích lazy loading
    public ShopResponse create(ShopRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        boolean isAlreadySeller = seller.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ROLE_SELLER"));

        if (isAlreadySeller) {
            throw new AppException(ErrorCode.RESOURCE_EXISTED); // Hoặc tạo lỗi riêng: SHOP_ALREADY_EXISTS
        }

        Role sellerRole = roleRepository.findByName("ROLE_SELLER")
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        seller.getRoles().add(sellerRole);

        Set<Category> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));

        Shop newShop = shopMapper.tShop(request);
        newShop.setSeller(seller);
        newShop.setCategories(categories);

        return shopMapper.toShopResponse(shopRepository.save(newShop));
    }

    @Transactional // giữ mạng gọi proxy - note trong model
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

        return productMapper.toProductResponseList(products);
    }

    @Transactional
    public void updateShopRating(Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        // 1. Lấy điểm trung bình cộng của các sản phẩm thuộc Shop
        Double avgRating = productRepository.getAverageRatingByShopId(shopId);

        // 2. Ghi đè điểm rating mới vào Shop
        shop.setRating(avgRating != null ? avgRating : 0.0);
    }

    @Transactional
    public PageResponse<ShopResponse> searchShops(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("rating").descending());
        Page<Shop> shopPage = shopRepository.searchShopsByKeyword(keyword, pageable);
        List<ShopResponse> content = shopMapper.toShopResponses(shopPage.getContent());
        return PageResponse.of(shopPage, content);
    }
}
