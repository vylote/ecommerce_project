package com.vlt.ecommerce.feature.product.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import com.vlt.ecommerce.feature.product.Category;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.dto.request.ProductRequest;
import com.vlt.ecommerce.feature.product.dto.response.ProductResponse;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "soldCount", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true) 
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "category", source = "categoryId", qualifiedByName = "idToCategory")
    Product toProduct(ProductRequest request);

    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "categoryId", source = "category.id")
    ProductResponse toProductResponse(Product product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "soldCount", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true) 
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "category", source = "categoryId", qualifiedByName = "idToCategory")
    void updateProduct(ProductRequest request, @MappingTarget Product product);

    @Named("idToCategory")
    default Category idToCategory(Long id) {
        if (id == null) {
            return null;
        }
        Category category = new Category();
        category.setId(id);
        return category;
    }

    List<ProductResponse> toProductsShopResponse(List<Product> products);
}
