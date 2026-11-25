package com.vlt.ecommerce.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

import com.vlt.ecommerce.domain.Product;
import com.vlt.ecommerce.domain.enumeration.ProductStatus;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

final class ProductSearchSpecification {

    private ProductSearchSpecification() {
    }

    static Specification<Product> matching(ProductFilter filter) {
        return (product, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.categoryId() != null) {
                //same as p.category.id
                predicates.add(builder.equal(product.get("category").get("id"), filter.categoryId()));
            }
            if (filter.shopId() != null) {
                predicates.add(builder.equal(product.get("shop").get("id"), filter.shopId()));
            }
            if (filter.keyword() != null) {
                String pattern = "%" + filter.keyword() + "%";
                predicates.add(builder.like(builder.lower(product.get("name")), builder.lower(builder.literal(pattern))));
            }
            if (filter.minPrice() != null) {
                predicates.add(builder.greaterThanOrEqualTo(product.get("price"), filter.minPrice()));
            }
            if (filter.maxPrice() != null) {
                predicates.add(builder.lessThanOrEqualTo(product.get("price"), filter.maxPrice()));
            }
            if (filter.minRating() != null) {
                predicates.add(builder.greaterThanOrEqualTo(product.get("averageRating"), filter.minRating()));
            }

            predicates.add(matchesStatus(product, builder, filter.status()));
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static Predicate matchesStatus(Root<Product> product, CriteriaBuilder builder, String filterStatus) {
        Path<ProductStatus> status = product.get("status");
        String selection = filterStatus == null ? "" : filterStatus.toUpperCase(Locale.ROOT);
        return switch (selection) {
            case "ALL" -> builder.notEqual(status, ProductStatus.DELETED);
            case "ACTIVE" -> builder.equal(status, ProductStatus.ACTIVE);
            case "INACTIVE" -> builder.equal(status, ProductStatus.INACTIVE);
            case "OUT_OF_STOCK" -> builder.and(
                    builder.equal(product.get("stockQuantity"), 0),
                    builder.notEqual(status, ProductStatus.DELETED));
            default -> builder.disjunction();
        };
    }
}
