package com.vlt.ecommerce.repository;

import java.math.BigDecimal;

import lombok.Builder;

@Builder
public record ProductFilter(
        Long categoryId,
        Long shopId,
        String keyword,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Double minRating,
        String status) {
}
