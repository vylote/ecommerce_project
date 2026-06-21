package com.vlt.ecommerce.feature.product;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import java.math.BigDecimal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.vlt.ecommerce.feature.product.dto.request.ProductImageRequest;
import com.vlt.ecommerce.feature.product.dto.request.ProductRequest;
import com.vlt.ecommerce.feature.product.repository.CategoryRepository;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;
import com.vlt.ecommerce.feature.shop.Shop;
import com.vlt.ecommerce.feature.shop.repository.ShopRepository;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.mapper.UserMapper;
import com.vlt.ecommerce.feature.user.repository.UserRepository;
import com.vlt.ecommerce.util.MockDataFactory;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ProductIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    UserMapper userMapper;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    ShopRepository shopRepository;

    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    UserRepository userRepository;

    @Value("${jwt.secret}")
    private String SIGNER_KEY;

    User mockSeller;
    Shop mockShop;
    Category mockCategory;
    String validSellerToken;

    // --- 3. CHUẨN BỊ MÔI TRƯỜNG (Chạy trước mỗi @Test) ---
    @BeforeEach
    void setUp() throws Exception {
        // Nhờ "Nhà máy" sản xuất dữ liệu sạch, không bao giờ lo lỗi Constraint
        mockSeller = userRepository.save(MockDataFactory.createValidSeller());
        mockShop = shopRepository.save(MockDataFactory.createValidShop(mockSeller));
        mockCategory = categoryRepository.save(MockDataFactory.createValidCategory());
        
        // Tự cấp Token thật cho Seller vừa tạo
        validSellerToken = generateTestToken(mockSeller);
    }

    @Test
    void getAllProducts_Success_WithDefaultParams() throws Exception {
        // Arrange: Bơm 1 sản phẩm vào DB trước để tẹo nữa lấy ra
        Product product = new Product();
        product.setName("Sản phẩm mẫu Test GET");
        product.setPrice(new BigDecimal("100000"));
        product.setStockQuantity(50);
        product.setShop(mockShop);
        product.setCategory(mockCategory);
        productRepository.save(product);

        // Act & Assert: Gọi API không cần Token
        mockMvc.perform(get("/products")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.currentPage").value(1))
                .andExpect(jsonPath("$.result.pageSize").value(10))
                .andExpect(jsonPath("$.result.data").isArray())
                .andExpect(jsonPath("$.result.data[0].name").value("Sản phẩm mẫu Test GET"));
    }

    @Test
    void createProduct_Success_WithSellerRole() throws Exception {
        // Arrange: Chuẩn bị Request Body
        ProductRequest request = new ProductRequest();
        request.setName("Áo thun nam");
        request.setDescription("Áo thun cotton 100%");
        request.setPrice(new BigDecimal("150000"));
        request.setStockQuantity(100);
        request.setCategoryId(mockCategory.getId());

        long initialCount = productRepository.count();

        // Act & Assert: Gọi API có đính kèm JWT
        mockMvc.perform(post("/products")
                .header("Authorization", "Bearer " + validSellerToken) 
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.name").value("Áo thun nam"))
                .andExpect(jsonPath("$.result.stockQuantity").value(100));

        // Xác minh dưới DB xem hàng đã thực sự được lưu chưa
        assertEquals(initialCount + 1, productRepository.count());
    }

    @Test
    void createProduct_Failed_Fobbiden_WhenUserIsBuyer() throws Exception {
        User buyer = userRepository.save(MockDataFactory.createValidBuyer());
        String buyerToken = generateTestToken(buyer);

        ProductRequest request = new ProductRequest();
        request.setName("Sản phẩm lậu");
        request.setPrice(new BigDecimal("100"));
        request.setStockQuantity(1);
        request.setCategoryId(mockCategory.getId());

        mockMvc.perform(post("/products")
                .header("Authorization", "Bearer "+buyerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateProduct_Success_WhenIsOwner() throws Exception {
        // 1. Arrange: Bơm 1 sản phẩm CỦA MOCK_SELLER vào DB
        Product product = new Product();
        product.setName("Áo thun cũ");
        product.setPrice(new BigDecimal("100000"));
        product.setStockQuantity(10);
        product.setShop(mockShop); // mockShop này thuộc về mockSeller (người đang giữ validSellerToken)
        product.setCategory(mockCategory);
        product = productRepository.save(product);

        ProductRequest updateRequest = new ProductRequest();
        updateRequest.setName("Áo thun phiên bản 2026");
        updateRequest.setDescription("Mẫu mới nhất");
        updateRequest.setPrice(new BigDecimal("150000"));
        updateRequest.setStockQuantity(50);
        updateRequest.setCategoryId(mockCategory.getId());

        // 2. Act & Assert: Gọi API update
        mockMvc.perform(put("/products/{id}", product.getId()) // Truyền ID vào URL
                .header("Authorization", "Bearer " + validSellerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.name").value("Áo thun phiên bản 2026"))
                .andExpect(jsonPath("$.result.price").value(150000));
    }

    // =========================================================================
    // KỊCH BẢN 5: TEST BẢO MẬT CHÉO - Seller A sửa sản phẩm của Seller B
    // =========================================================================
    @Test
    void updateProduct_Failed_Forbidden_WhenNotOwner() throws Exception {
        // 1. Arrange: Vẫn dùng sản phẩm CỦA MOCK_SELLER đã lưu dưới DB
        Product productOfMockSeller = new Product();
        productOfMockSeller.setName("Sản phẩm xịn của tôi");
        productOfMockSeller.setPrice(new BigDecimal("500000"));
        productOfMockSeller.setStockQuantity(100);
        productOfMockSeller.setShop(mockShop); 
        productOfMockSeller.setCategory(mockCategory);
        productOfMockSeller = productRepository.save(productOfMockSeller);

        // Khởi tạo Seller thứ 2 (Kẻ gian)
        User badSeller = userRepository.save(MockDataFactory.createValidSeller());
        String badSellerToken = generateTestToken(badSeller); // Lấy Token của kẻ gian

        ProductRequest maliciousRequest = new ProductRequest();
        maliciousRequest.setName("Đã bị Hack");
        maliciousRequest.setPrice(new BigDecimal("1000")); // Sửa giá láo
        maliciousRequest.setStockQuantity(0);
        maliciousRequest.setCategoryId(mockCategory.getId());

        // 2. Act & Assert: Kẻ gian dùng Token của mình để sửa SP của người khác
        mockMvc.perform(put("/products/{id}", productOfMockSeller.getId())
                .header("Authorization", "Bearer " + badSellerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(maliciousRequest)))
                
                // Kỳ vọng lớp khiên @productSecurity.isOwner(#id) sẽ đá văng request này!
                .andExpect(status().isForbidden()); 
    }

    @Test
    void deleteProduct_Success_WhenIsOwner() throws Exception{
        // 1. Arrange: Bơm 1 sản phẩm CỦA MOCK_SELLER vào DB
        Product product = new Product();
        product.setName("Áo thun cũ");
        product.setPrice(new BigDecimal("100000"));
        product.setStockQuantity(10);
        product.setShop(mockShop); // mockShop này thuộc về mockSeller (người đang giữ validSellerToken)
        product.setCategory(mockCategory);
        product = productRepository.save(product);

        long initialCount = productRepository.count();

        // 2. Act & Assert: Gọi API DELETE có đính kèm JWT
        mockMvc.perform(delete("/products/{id}", product.getId())
                .header("Authorization", "Bearer " + validSellerToken))
                // Kỳ vọng API trả về thành công
                .andExpect(status().isOk());

        // Xác minh dưới DB xem hàng đã thực sự được lưu chưa
        assertEquals(initialCount - 1, productRepository.count());        
    }

    @Test
    void getDetailProduct_Success() throws Exception {
        // 1. Arrange: Bơm 1 sản phẩm CỦA MOCK_SELLER vào DB
        Product product = new Product();
        product.setName("Áo thun cũ");
        product.setPrice(new BigDecimal("100000"));
        product.setStockQuantity(10);
        product.setCategory(mockCategory);
        product.setShop(mockShop);
        product = productRepository.save(product);

        mockMvc.perform(get("/products/{id}", product.getId()))
                // Kỳ vọng API trả về thành công
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.name").value("Áo thun cũ"))
                .andExpect(jsonPath("$.result.price").value(100000));
    }

    @Test
    void addProductImage_Success_WhenIsOwner() throws Exception {
        Product product = new Product();
        product.setName("Áo thun cũ");
        product.setPrice(new BigDecimal("100000"));
        product.setStockQuantity(10);
        product.setCategory(mockCategory);
        product.setShop(mockShop);
        product = productRepository.save(product);

        ProductImageRequest imageRequest = new ProductImageRequest();
        imageRequest.setUrl("anh1.png");
        

        mockMvc.perform(post("/products/{id}/images", product.getId())
                .header("Authorization", "Bearer " + validSellerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(imageRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.url").value("anh1.png"))
                .andExpect(jsonPath("$.result.productId").value(product.getId()));
    }
// --- HÀM TIỆN ÍCH DÙNG CHUNG TRONG CLASS ---
    private String generateTestToken(User user) throws Exception {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        
        // Sửa lại tên biến cho đồng nhất là jwtClaimsSet
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("mini-ecommerce")
                .issueTime(new java.util.Date())
                .expirationTime(new java.util.Date(java.time.Instant.now().plus(24, java.time.temporal.ChronoUnit.HOURS).toEpochMilli()))
                .jwtID(java.util.UUID.randomUUID().toString())
                .claim("scope", "ROLE_" + user.getRole().name())
                .claim("userId", user.getId())
                .build();
                
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);
        
        // Dùng biến SIGNER_KEY đã khai báo ở đầu file test
        jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes())); 
        
        return jwsObject.serialize(); 
    }
}