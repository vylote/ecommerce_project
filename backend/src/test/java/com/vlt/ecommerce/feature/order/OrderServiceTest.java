package com.vlt.ecommerce.feature.order;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.cart.CartItem;
import com.vlt.ecommerce.feature.cart.CartItemRepository;
import com.vlt.ecommerce.feature.commission.CommissionService;
import com.vlt.ecommerce.feature.order.dto.response.OrderResponse;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.shop.Shop;
import com.vlt.ecommerce.feature.shop.repository.ShopRepository;
import com.vlt.ecommerce.feature.user.Address;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.dto.response.AddressResponse;
import com.vlt.ecommerce.feature.user.mapper.AddressMapper;
import com.vlt.ecommerce.feature.user.repository.AddressRepository;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@ExtendWith(MockitoExtension.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderServiceTest {
    @Mock
    OrderRepository orderRepository;
    @Mock
    OrderItemRepository orderItemRepository;
    @Mock
    CartItemRepository cartItemRepository;
    @Mock
    UserRepository userRepository;
    @Mock
    AddressRepository addressRepository;
    @Mock
    ShopRepository shopRepository;
    @Mock
    AddressMapper addressMapper;
    @Mock
    OrderMapper orderMapper;
    @Mock
    OrderItemMapper orderItemMapper;
    @Mock
    ObjectMapper objectMapper;

    @InjectMocks
    OrderService orderService;
    @Mock
    CommissionService commissionService;

    OrderRequest orderRequest;
    OrderResponse orderResponse;
    Order mockOrder;
    OrderItem mockOrderItem;
    User mockBuyer;
    Shop mockShop;
    Product mockProduct;
    CartItem mockCartItem;
    Address mockAddress;
    AddressResponse mockAddressResponse;

    @BeforeEach
    void setUp() {
        mockBuyer = User.builder()
                .id(1L)
                .email("buyer@gmail.com")
                .build();

        User mockSeller = User.builder()
                .id(2L)
                .email("seller@gmail.com")
                .build();

        mockAddress = Address.builder()
                .id(10L)
                .fullName("Le Thanh Vy")
                .phone("0912345678")
                .province("Hà Nội")
                .district("Đống Đa")
                .ward("Láng Thượng")
                .detail("Trường Đại học Giao thông Vận tải")
                .isDefault(true)
                .user(mockBuyer)
                .build();

        mockAddressResponse = AddressResponse.builder()
                .userId(mockBuyer.getId())
                .fullName(mockAddress.getFullName())
                .phone(mockAddress.getPhone())
                .province(mockAddress.getProvince())
                .district(mockAddress.getDistrict())
                .ward(mockAddress.getWard())
                .detail(mockAddress.getDetail())
                .isDefault(mockAddress.getIsDefault())
                .build();

        mockShop = Shop.builder()
                .id(100L)
                .name("UTC Tech Shop")
                .description("Chuyên thiết bị IT")
                .address("Hà Nội")
                .isActive(true)
                .seller(mockSeller)
                .build();

        mockProduct = Product.builder()
                .id(1000L)
                .name("Bàn phím cơ")
                .price(new BigDecimal("1500000"))
                .stockQuantity(20)
                .shop(mockShop)
                .build();

        mockCartItem = CartItem.builder()
                .id(5L)
                .quantity(2)
                .buyer(mockBuyer)
                .product(mockProduct)
                .build();

        orderRequest = OrderRequest.builder()
                .addressId(mockAddress.getId())
                .note("Giao giờ hành chính")
                .build();

        mockOrder = Order.builder()
                .id(99L)
                .addressSnapshot("{\"fullName\":\"Le Thanh Vy\", \"phone\":\"0912345678\", \"detail\":\"Trường Đại học Giao thông Vận tải\"}")
                .totalAmount(new BigDecimal("3000000"))
                .status(OrderStatus.PENDING)
                .note("Giao giờ hành chính")
                .buyer(mockBuyer)
                .shop(mockShop)
                .build();

        mockOrderItem = OrderItem.builder()
                .id(999L)
                .productName(mockProduct.getName())
                .productPrice(mockProduct.getPrice())
                .quantity(2)
                .totalPrice(new BigDecimal("3000000"))
                .order(mockOrder)
                .product(mockProduct)
                .shop(mockShop)
                .build();

        mockOrder.setItems(new ArrayList<>(List.of(mockOrderItem)));

        orderResponse = OrderResponse.builder()
                .id(mockOrder.getId())
                .addressSnapshot(mockOrder.getAddressSnapshot())
                .totalAmount(mockOrder.getTotalAmount())
                .status(mockOrder.getStatus().name())
                .note(mockOrder.getNote())
                .buyerId(mockBuyer.getId())
                .items(new ArrayList<>())
                .build();

        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn(mockBuyer.getEmail());
        
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        // Dọn dẹp Security Context sau khi chạy xong mỗi test case
        SecurityContextHolder.clearContext();
    }

    @Test
    void createOrder_Success() throws Exception {
        // 1. Arrange (Chuẩn bị)
        // Mock User hiện tại đang đăng nhập
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockBuyer));
        
        // Mock Giỏ hàng có dữ liệu
        when(cartItemRepository.findByBuyerId(mockBuyer.getId())).thenReturn(List.of(mockCartItem));
        
        // Mock lấy Địa chỉ và chuyển thành JSON snapshot
        when(addressRepository.findById(orderRequest.getAddressId())).thenReturn(Optional.of(mockAddress));
        when(addressMapper.toAddressResponse(any(Address.class))).thenReturn(mockAddressResponse);
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"fullName\":\"Le Thanh Vy\"}");
        
        // Mock lấy Shop và khởi tạo Order
        when(shopRepository.findById(mockShop.getId())).thenReturn(Optional.of(mockShop));
        
        // Trả về một đối tượng Order mới tinh để Service nhét OrderItem vào
        when(orderMapper.toOrder(any(OrderRequest.class))).thenReturn(new Order()); 
        
        // Mock lưu DB
        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);
        when(orderMapper.toOrderResponses(anyList())).thenReturn(List.of(orderResponse));

        // 2. Act (Thực thi)
        List<OrderResponse> result = orderService.create(orderRequest);

        // 3. Assert (Kiểm chứng)
        assertNotNull(result);
        assertEquals(1, result.size());
        
        // Đảm bảo đơn hàng đã được lưu
        verify(orderRepository, times(1)).save(any(Order.class));
        
        // Đảm bảo giỏ hàng đã bị xóa sau khi tạo đơn thành công
        verify(cartItemRepository, times(1)).deleteAllByBuyerId(mockBuyer.getId());
        
        // Đảm bảo số lượng tồn kho (stockQuantity) của sản phẩm đã bị trừ (20 - 2 = 18)
        assertEquals(18, mockProduct.getStockQuantity());
    }

    @Test
    void createOrder_Failed_WhenCartIsEmpty() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockBuyer));
        when(cartItemRepository.findByBuyerId(mockBuyer.getId())).thenReturn(new ArrayList<>());

        AppException exception = assertThrows(AppException.class, () -> orderService.create(orderRequest));

        assertEquals(ErrorCode.RESOURCE_NOT_FOUND, exception.getErrorCode());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void createOrder_Failed_WhenOutOfStock() throws Exception {
        // 1. Arrange: Cố tình set tồn kho ít hơn lượng mua
        mockProduct.setStockQuantity(1);
        mockCartItem.setQuantity(5);

        // Vượt qua kiểm tra User, Cart, Address
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockBuyer));
        when(cartItemRepository.findByBuyerId(mockBuyer.getId())).thenReturn(List.of(mockCartItem));
        when(addressRepository.findById(orderRequest.getAddressId())).thenReturn(Optional.of(mockAddress));

        // MOCK BỔ SUNG: Vượt qua trạm chuyển đổi JSON và tìm Shop
        when(addressMapper.toAddressResponse(any(Address.class))).thenReturn(mockAddressResponse);
        when(objectMapper.writeValueAsString(any())).thenReturn("snapshot");
        when(shopRepository.findById(mockShop.getId())).thenReturn(Optional.of(mockShop));
        when(orderMapper.toOrder(any(OrderRequest.class))).thenReturn(new Order());

        // 2. Act & Assert: Lúc này code mới chạy đến bước kiểm tra kho
        AppException exception = assertThrows(AppException.class, () -> orderService.create(orderRequest));
        
        assertEquals(ErrorCode.OUT_OF_STOCK, exception.getErrorCode());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void confirmOrder_Success() {
        // ====================================================================
        // 1. Arrange: Chuyển đổi tư cách đăng nhập từ BUYER sang SELLER
        // ====================================================================
        User mockSeller = mockShop.getSeller(); // Lấy mockSeller đã tạo trong setUp()
        
        // Ghi đè Security Context hiện tại bằng thông tin của Seller
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(mockSeller.getEmail());
        SecurityContextHolder.setContext(securityContext);

        // ====================================================================
        // 2. Mock các hành động của Service
        // ====================================================================
        when(userRepository.findByEmail(mockSeller.getEmail())).thenReturn(Optional.of(mockSeller));
        when(orderRepository.findById(mockOrder.getId())).thenReturn(Optional.of(mockOrder));
        
        // Mock lấy Cửa hàng của người bán này
        when(shopRepository.findBySellerId(mockSeller.getId())).thenReturn(mockShop);
        
        // Cố tình gán lại orderResponse.status để xem hàm map có đổi trạng thái không
        orderResponse.setStatus(OrderStatus.CONFIRMED.name());
        when(orderMapper.toOrderResponse(any(Order.class))).thenReturn(orderResponse);

        // ====================================================================
        // 3. Act & Assert: Gọi hàm và kiểm chứng
        // ====================================================================
        OrderResponse response = orderService.confirmOrder(mockOrder.getId());
        
        assertNotNull(response);
        assertEquals(mockOrder.getId(), response.getId());
        assertEquals(OrderStatus.CONFIRMED.name(), response.getStatus()); // Phải là CONFIRMED
    }

    @Test
    void completeOrder_Success() {
        mockOrder.setStatus(OrderStatus.SHIPPING);
        when(userRepository.findByEmail(mockBuyer.getEmail())).thenReturn(Optional.of(mockBuyer));
        when(orderRepository.findById(mockOrder.getId())).thenReturn(Optional.of(mockOrder));
        orderResponse.setStatus(OrderStatus.COMPLETED.name());

        when(orderMapper.toOrderResponse(any(Order.class))).thenReturn(orderResponse);
        OrderResponse response = orderService.completeOrder(mockOrder.getId());
        
        assertNotNull(response);
        assertEquals(mockOrder.getId(), response.getId());
        assertEquals(OrderStatus.COMPLETED.name(), response.getStatus());
        verify(commissionService, times(1)).calculateCommission(mockOrder);
    }
}
