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

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AddressRepository addressRepository;
    @Mock
    private ShopRepository shopRepository;
    @Mock
    private AddressMapper addressMapper;
    @Mock
    private OrderMapper orderMapper;
    @Mock
    private OrderItemMapper orderItemMapper;
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private OrderService orderService;

    private OrderRequest orderRequest;
    private OrderResponse orderResponse;
    private Order mockOrder;
    private OrderItem mockOrderItem;
    private User mockBuyer;
    private Shop mockShop;
    private Product mockProduct;
    private CartItem mockCartItem;
    private Address mockAddress;
    private AddressResponse mockAddressResponse;

    @BeforeEach
    void setUp() {
        mockBuyer = new User();
        mockBuyer.setId(1L);
        mockBuyer.setEmail("buyer@gmail.com");

        User mockSeller = new User();
        mockSeller.setId(2L);
        mockSeller.setEmail("seller@gmail.com");

        mockAddress = new Address();
        mockAddress.setId(10L);
        mockAddress.setFullName("Le Thanh Vy");
        mockAddress.setPhone("0912345678");
        mockAddress.setProvince("Hà Nội");
        mockAddress.setDistrict("Đống Đa");
        mockAddress.setWard("Láng Thượng");
        mockAddress.setDetail("Trường Đại học Giao thông Vận tải");
        mockAddress.setIsDefault(true);
        mockAddress.setUser(mockBuyer);

        mockAddressResponse = new AddressResponse();
        mockAddressResponse.setUserId(mockBuyer.getId());
        mockAddressResponse.setFullName(mockAddress.getFullName());
        mockAddressResponse.setPhone(mockAddress.getPhone());
        mockAddressResponse.setProvince(mockAddress.getProvince());
        mockAddressResponse.setDistrict(mockAddress.getDistrict());
        mockAddressResponse.setWard(mockAddress.getWard());
        mockAddressResponse.setDetail(mockAddress.getDetail());
        mockAddressResponse.setIsDefault(mockAddress.getIsDefault());

        mockShop = new Shop();
        mockShop.setId(100L);
        mockShop.setName("UTC Tech Shop");
        mockShop.setDescription("Chuyên thiết bị IT");
        mockShop.setAddress("Hà Nội");
        mockShop.setIsActive(true);
        mockShop.setSeller(mockSeller);

        mockProduct = new Product();
        mockProduct.setId(1000L);
        mockProduct.setName("Bàn phím cơ");
        mockProduct.setPrice(new BigDecimal("1500000"));
        mockProduct.setStockQuantity(20);
        mockProduct.setShop(mockShop);

        mockCartItem = new CartItem();
        mockCartItem.setId(5L);
        mockCartItem.setQuantity(2);
        mockCartItem.setBuyer(mockBuyer);
        mockCartItem.setProduct(mockProduct);

        orderRequest = new OrderRequest();
        orderRequest.setAddressId(mockAddress.getId());
        orderRequest.setNote("Giao giờ hành chính");

        mockOrder = new Order();
        mockOrder.setId(99L);
        mockOrder.setAddressSnapshot("{\"fullName\":\"Le Thanh Vy\", \"phone\":\"0912345678\", \"detail\":\"Trường Đại học Giao thông Vận tải\"}");
        mockOrder.setTotalAmount(new BigDecimal("3000000"));
        mockOrder.setStatus(OrderStatus.PENDING);
        mockOrder.setNote("Giao giờ hành chính");
        mockOrder.setBuyer(mockBuyer);
        mockOrder.setShop(mockShop);

        mockOrderItem = new OrderItem();
        mockOrderItem.setId(999L);
        mockOrderItem.setProductName(mockProduct.getName());
        mockOrderItem.setProductPrice(mockProduct.getPrice());
        mockOrderItem.setQuantity(2);
        mockOrderItem.setTotalPrice(new BigDecimal("3000000"));
        mockOrderItem.setOrder(mockOrder);
        mockOrderItem.setProduct(mockProduct);
        mockOrderItem.setShop(mockShop);

        mockOrder.setItems(new ArrayList<>(List.of(mockOrderItem)));

        orderResponse = new OrderResponse();
        orderResponse.setId(mockOrder.getId());
        orderResponse.setAddressSnapshot(mockOrder.getAddressSnapshot());
        orderResponse.setTotalAmount(mockOrder.getTotalAmount());
        orderResponse.setStatus(mockOrder.getStatus().name());
        orderResponse.setNote(mockOrder.getNote());
        orderResponse.setBuyerId(mockBuyer.getId());
        orderResponse.setItems(new ArrayList<>());

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
    }
}
