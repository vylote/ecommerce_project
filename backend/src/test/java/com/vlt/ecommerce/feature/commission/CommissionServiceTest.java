package com.vlt.ecommerce.feature.commission;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.order.Order;
import com.vlt.ecommerce.feature.order.OrderItem;
import com.vlt.ecommerce.feature.order.OrderStatus;
import com.vlt.ecommerce.feature.product.Category;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.shop.Shop;
import com.vlt.ecommerce.feature.user.User;

@ExtendWith(MockitoExtension.class)
public class CommissionServiceTest {
    @Mock
    CommissionConfigRepository commissionConfigRepository;
    @Mock
    CommissionRecordRepository commissionRecordRepository;
    @InjectMocks
    CommissionService commissionService;
    @Captor
    ArgumentCaptor<CommissionRecord> recordCaptor;

    Order mockOrder;
    OrderItem mockOrderItem;
    Category mockCategory;
    CommissionConfig mockCategoryConfig;
    CommissionConfig mockGlobalConfig;

    @BeforeEach
    void setUp() {
        User seller = User.builder().id(1L).build();
        Shop shop = Shop.builder().id(10L).seller(seller).build();
        
        mockCategory = Category.builder().id(100L).build();
        
        Product product = Product.builder()
                .id(500L)
                .category(mockCategory)
                .build();

        // 1 Sản phẩm giá 100,000
        mockOrderItem = OrderItem.builder()
                .id(1000L)
                .product(product)
                .shop(shop)
                .totalPrice(new BigDecimal("100000.00")) 
                .build();

        mockOrder = Order.builder()
                .id(5000L)
                .status(OrderStatus.COMPLETED)
                .items(List.of(mockOrderItem))
                .build();

        // Cấu hình phí riêng 10%
        mockCategoryConfig = new CommissionConfig();
        mockCategoryConfig.setRate(new BigDecimal("0.10"));

        // Cấu hình phí Global 5%
        mockGlobalConfig = new CommissionConfig();
        mockGlobalConfig.setRate(new BigDecimal("0.05"));
    }

    @Test
    void calculateCommission_Success_WithCategoryRate() {
        // Mock 1: Tìm thấy cấu hình riêng của danh mục
        when(commissionConfigRepository.findActiveConfigByCategory(eq(100L), any(LocalDate.class)))
                .thenReturn(Optional.of(mockCategoryConfig));

        // Thực thi
        commissionService.calculateCommission(mockOrder);

        // Kiểm tra
        verify(commissionRecordRepository, times(1)).save(recordCaptor.capture());
        CommissionRecord savedRecord = recordCaptor.getValue();

        assertEquals(0, new BigDecimal("0.10").compareTo(savedRecord.getCommissionRate()));
        assertEquals(0, new BigDecimal("100000.00").compareTo(savedRecord.getItemRevenue()));
        
        // Tiền phí: 100,000 * 10% = 10,000
        assertEquals(0, new BigDecimal("10000.00").compareTo(savedRecord.getCommissionAmount()));
        
        // Tiền nhận: 100,000 - 10,000 = 90,000
        assertEquals(0, new BigDecimal("90000.00").compareTo(savedRecord.getNetRevenue()));
    }

    @Test
    void calculateCommission_Success_WithGlobalFallbackRate() {
        // Mock 1: KHÔNG tìm thấy cấu hình danh mục
        when(commissionConfigRepository.findActiveConfigByCategory(eq(100L), any(LocalDate.class)))
                .thenReturn(Optional.empty());
                
        // Mock 2: Rơi xuống tìm cấu hình Global
        when(commissionConfigRepository.findActiveGlobalConfig(any(LocalDate.class)))
                .thenReturn(Optional.of(mockGlobalConfig));

        // Thực thi
        commissionService.calculateCommission(mockOrder);

        // Kiểm tra
        verify(commissionRecordRepository, times(1)).save(recordCaptor.capture());
        CommissionRecord savedRecord = recordCaptor.getValue();

        assertEquals(0, new BigDecimal("0.05").compareTo(savedRecord.getCommissionRate()));
        
        // Tiền phí: 100,000 * 5% = 5,000
        assertEquals(0, new BigDecimal("5000.00").compareTo(savedRecord.getCommissionAmount()));
        
        // Tiền nhận: 100,000 - 5,000 = 95,000
        assertEquals(0, new BigDecimal("95000.00").compareTo(savedRecord.getNetRevenue()));
    }

    @Test
    void calculateCommission_Failed_OrderNotCompleted() {
        // Setup: Đơn hàng mới PENDING
        mockOrder.setStatus(OrderStatus.PENDING);

        // Thực thi & Bắt ngoại lệ
        AppException exception = assertThrows(AppException.class, () -> {
            commissionService.calculateCommission(mockOrder);
        });

        // Kiểm tra mã lỗi
        assertEquals(ErrorCode.INVALID_ORDER_STATUS, exception.getErrorCode());
        
        // Tuyệt đối không được gọi xuống DB
        verify(commissionConfigRepository, never()).findActiveConfigByCategory(any(), any());
        verify(commissionRecordRepository, never()).save(any());
    }

    @Test
    void calculateCommission_Failed_NoConfigFound() {
        // Mock: KHÔNG tìm thấy cấu hình danh mục LẪN cấu hình Global
        when(commissionConfigRepository.findActiveConfigByCategory(eq(100L), any(LocalDate.class)))
                .thenReturn(Optional.empty());
        when(commissionConfigRepository.findActiveGlobalConfig(any(LocalDate.class)))
                .thenReturn(Optional.empty());

        // Thực thi & Bắt ngoại lệ
        AppException exception = assertThrows(AppException.class, () -> {
            commissionService.calculateCommission(mockOrder);
        });

        // Kiểm tra mã lỗi
        assertEquals(ErrorCode.COMMISSION_NOT_CONFIGURED, exception.getErrorCode());
        
        // Tuyệt đối không được lưu bản ghi nào
        verify(commissionRecordRepository, never()).save(any());
    }
}
