package com.vlt.ecommerce.feature.commission;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import com.vlt.ecommerce.feature.commission.dto.request.CommissionConfigRequest;
import com.vlt.ecommerce.feature.commission.dto.response.CommissionConfigResponse;
import com.vlt.ecommerce.feature.product.Category;
import com.vlt.ecommerce.feature.user.User;

@Mapper(componentModel = "spring")
public interface CommissionConfigMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    CommissionConfig toCommissionConfig(CommissionConfigRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", source = "categoryId", qualifiedByName = "idToCategory")
    @Mapping(target = "createdBy", source = "userId", qualifiedByName = "idToUser")
    void updateCommissionConfig(CommissionConfigRequest request, @MappingTarget CommissionConfig config);

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
    @Named("idToUser")
    default User idToUser(Long id) {
        if (id == null) {
            return null;
        }
        // Chỉ cần tạo đối tượng có ID, Hibernate sẽ tự hiểu đây là khóa ngoại
        // Giúp tiết kiệm 1 câu lệnh SELECT thừa xuống Database!
        User user = new User();
        user.setId(id);
        return user;
    }

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "createdById", source = "createdBy.id")
    CommissionConfigResponse toCommissionConfigResponse(CommissionConfig config);

    List<CommissionConfigResponse> toCommissionConfigResponses(List<CommissionConfig> configs);
}
