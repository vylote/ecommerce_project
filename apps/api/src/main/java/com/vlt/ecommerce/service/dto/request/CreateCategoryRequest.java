package com.vlt.ecommerce.service.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCategoryRequest extends CategoryRequest {

    @DecimalMin(value = "0", message = "{validation.category.commissionRate.range}")
    @DecimalMax(value = "1", message = "{validation.category.commissionRate.range}")
    @Digits(integer = 1, fraction = 4, message = "{validation.category.commissionRate.precision}")
    private BigDecimal commissionRate;
}
