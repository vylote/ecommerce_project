package com.vlt.ecommerce.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.vlt.ecommerce.service.dto.response.PageResponse;
import com.vlt.ecommerce.service.dto.response.ProductResponse;
import com.vlt.ecommerce.service.dto.request.ShopRequest;
import com.vlt.ecommerce.service.dto.response.ShopResponse;

public interface ShopService {

    ShopResponse create(ShopRequest request, MultipartFile file);

    ShopResponse update(ShopRequest request, Long id, MultipartFile file);

    ShopResponse get(Long id);

    ShopResponse getMyShop();

    List<ProductResponse> getProductsShop(Long shopId);

    PageResponse<ShopResponse> searchShops(String keyword, int page, int size);

    PageResponse<ShopResponse> getShopsForAdmin(String keyword, Boolean isActive, int page, int size);

    ShopResponse toggleShopStatus(Long shopId);

    Map<String, Long> getShopStatsForAdmin();

    void updateShopRating(Long shopId);
}
