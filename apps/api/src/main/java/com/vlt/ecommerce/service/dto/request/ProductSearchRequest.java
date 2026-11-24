package com.vlt.ecommerce.service.dto.request;

import java.math.BigDecimal;

public record ProductSearchRequest(
        Long categoryId,
        Long shopId,
        String keyword,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Double minRating,
        String status,
        Integer page,
        Integer size,
        String sortBy,
        String order) {

    public ProductSearchRequest {
        page = page == null ? 1 : page;
        size = size == null ? 10 : size;
        sortBy = sortBy == null || sortBy.isEmpty() ? "createdAt" : sortBy;
        order = order == null || order.isEmpty() ? "desc" : order;
    }
}
