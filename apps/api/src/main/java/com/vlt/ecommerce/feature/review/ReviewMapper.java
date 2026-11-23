package com.vlt.ecommerce.feature.review;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.vlt.ecommerce.feature.order.Order;
import com.vlt.ecommerce.feature.product.Product;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "buyer", ignore = true)
    @Mapping(target = "product", source = "productId", qualifiedByName = "idToProduct")
    @Mapping(target = "order", source = "orderId", qualifiedByName = "idToOrder")
    Review toReview(CreateReviewRequest request);

    @Named("idToProduct")
    default Product idToProduct(Long id) {
        if (id == null) return null;
        Product product = new Product();
        product.setId(id);
        return product;
    }
    @Named("idToOrder")
    default Order idToOrder(Long id) {
        if (id == null) return null;
        Order order = new Order();
        order.setId(id);
        return order;
    }

    @Mapping(target = "buyerId", source = "buyer.id")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "buyerName", source = "buyer.fullName")
    @Mapping(target = "buyerAvatarUrl", source = "buyer.avatarUrl")
    ReviewResponse toReviewResponse(Review review);

    List<ReviewResponse> toReviewResponses(List<Review> reviews);
}
