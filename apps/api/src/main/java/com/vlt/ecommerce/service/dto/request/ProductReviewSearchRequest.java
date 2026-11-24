package com.vlt.ecommerce.service.dto.request;

public record ProductReviewSearchRequest(Integer rating, Integer page, Integer size) {

    public ProductReviewSearchRequest {
        page = page == null ? 1 : page;
        size = size == null ? 10 : size;
    }
}
