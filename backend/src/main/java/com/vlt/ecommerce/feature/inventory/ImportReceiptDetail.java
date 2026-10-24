package com.vlt.ecommerce.feature.inventory;

import java.math.BigDecimal;

import com.vlt.ecommerce.feature.product.SpecificProduct;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "import_receipt_details")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImportReceiptDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id", nullable = false)
    ImportReceipt importReceipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specific_product_id", nullable = false)
    SpecificProduct specificProduct;

    @Column(nullable = false)
    Integer quantity;

    @Column(name = "import_price", nullable = false, precision = 15, scale = 2)
    BigDecimal importPrice;

    @Column(name = "total_price", nullable = false, precision = 15, scale = 2)
    BigDecimal totalPrice;
}
