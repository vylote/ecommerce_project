package com.vlt.ecommerce.feature.product.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import com.vlt.ecommerce.feature.product.Category;
import com.vlt.ecommerce.feature.product.dto.request.CategoryRequest;
import com.vlt.ecommerce.feature.product.dto.response.CategoryResponse;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(source = "parent.id", target = "parentId")
    CategoryResponse toCategoryResponse(Category category);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", source = "parentId", qualifiedByName = "idToCategory")
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "configs", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "shops", ignore = true)
    Category toCategory(CategoryRequest request);

    List<CategoryResponse> toCategoriesResponse(List<Category> categories);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", source = "parentId", qualifiedByName = "idToCategory")
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "configs", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "shops", ignore = true)
    void updateCategoryFromRequest(CategoryRequest request, @MappingTarget Category category);

    @Named("idToCategory")
    default Category idToCategory(Long id) {
        if (id == null) {
            return null;
        }
        // Chỉ cần tạo đối tượng có ID, Hibernate sẽ tự hiểu đây là khóa ngoại
        // Giúp tiết kiệm 1 câu lệnh SELECT thừa xuống Database!
        Category category = new Category();
        category.setId(id);
        return category;
    }
    
} 
