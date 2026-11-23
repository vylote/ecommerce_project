package com.vlt.ecommerce.feature.inventory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vlt.ecommerce.common.dto.PageResponse;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.inventory.dto.request.ImportReceiptDetailRequest;
import com.vlt.ecommerce.feature.inventory.dto.request.ImportReceiptRequest;
import com.vlt.ecommerce.feature.inventory.dto.response.ImportReceiptResponse;
import com.vlt.ecommerce.feature.inventory.mapper.ImportReceiptMapper;
import com.vlt.ecommerce.feature.inventory.repository.ImportReceiptRepository;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.product.SpecificProduct;
import com.vlt.ecommerce.feature.product.repository.ProductRepository;
import com.vlt.ecommerce.feature.product.repository.SpecificProductRepository;
import com.vlt.ecommerce.feature.shop.Shop;
import com.vlt.ecommerce.feature.shop.repository.ShopRepository;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ImportReceiptService {

    ImportReceiptRepository importReceiptRepository;
    ProductRepository productRepository;
    SpecificProductRepository specificProductRepository;
    ShopRepository shopRepository;
    UserRepository userRepository;
    ImportReceiptMapper importReceiptMapper;

    @Transactional
    @PreAuthorize("hasRole('SELLER')")
    public ImportReceiptResponse createReceipt(ImportReceiptRequest request) {
        User currentUser = getCurrentUser();
        Shop shop = shopRepository.findBySellerId(currentUser.getId());
        if (shop == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!product.getShop().getId().equals(shop.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String receiptCode = request.getReceiptCode();
        if (receiptCode == null || receiptCode.trim().isEmpty()) {
            receiptCode = "PNK-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                    + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } else {
            if (importReceiptRepository.existsByReceiptCode(receiptCode)) {
                throw new AppException(ErrorCode.RESOURCE_EXISTED);
            }
        }

        ImportReceiptStatus status = request.getStatus() != null ? request.getStatus() : ImportReceiptStatus.COMPLETED;

        ImportReceipt receipt = ImportReceipt.builder()
                .receiptCode(receiptCode)
                .user(currentUser)
                .shop(shop)
                .product(product)
                .note(request.getNote())
                .status(status)
                .totalCost(BigDecimal.ZERO)
                .details(new ArrayList<>())
                .build();

        BigDecimal totalCost = BigDecimal.ZERO;
        int totalImportQty = 0;

        for (ImportReceiptDetailRequest detailReq : request.getDetails()) {
            SpecificProduct variant = specificProductRepository.findById(detailReq.getSpecificProductId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new AppException(ErrorCode.INVALID_DATA);
            }

            BigDecimal itemTotalPrice = detailReq.getImportPrice()
                    .multiply(BigDecimal.valueOf(detailReq.getQuantity()));

            ImportReceiptDetail detail = ImportReceiptDetail.builder()
                    .importReceipt(receipt)
                    .specificProduct(variant)
                    .quantity(detailReq.getQuantity())
                    .importPrice(detailReq.getImportPrice())
                    .totalPrice(itemTotalPrice)
                    .build();

            receipt.getDetails().add(detail);
            totalCost = totalCost.add(itemTotalPrice);
            totalImportQty += detailReq.getQuantity();

            // Nếu phiếu ở trạng thái COMPLETED, tăng kho biến thể ngay
            if (status == ImportReceiptStatus.COMPLETED) {
                variant.setStockQuantity(variant.getStockQuantity() + detailReq.getQuantity());
                specificProductRepository.save(variant);
            }
        }

        receipt.setTotalCost(totalCost);

        // Tăng tồn kho tổng của sản phẩm cha nếu phiếu đã hoàn thành
        if (status == ImportReceiptStatus.COMPLETED) {
            product.setStockQuantity(product.getStockQuantity() + totalImportQty);
            productRepository.save(product);
        }

        ImportReceipt saved = importReceiptRepository.save(receipt);
        log.info("Đã tạo phiếu nhập kho {} cho sản phẩm ID {}, tổng tiền: {}", 
                saved.getReceiptCode(), product.getId(), saved.getTotalCost());

        return importReceiptMapper.toResponse(saved);
    }

    @Transactional
    @PreAuthorize("hasRole('SELLER')")
    public ImportReceiptResponse completeReceipt(Long id) {
        User currentUser = getCurrentUser();
        Shop shop = shopRepository.findBySellerId(currentUser.getId());
        if (shop == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        ImportReceipt receipt = importReceiptRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!receipt.getShop().getId().equals(shop.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (receipt.getStatus() != ImportReceiptStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        int totalImportQty = 0;
        for (ImportReceiptDetail detail : receipt.getDetails()) {
            SpecificProduct variant = detail.getSpecificProduct();
            variant.setStockQuantity(variant.getStockQuantity() + detail.getQuantity());
            specificProductRepository.save(variant);
            totalImportQty += detail.getQuantity();
        }

        Product product = receipt.getProduct();
        product.setStockQuantity(product.getStockQuantity() + totalImportQty);
        productRepository.save(product);

        receipt.setStatus(ImportReceiptStatus.COMPLETED);
        ImportReceipt updated = importReceiptRepository.save(receipt);

        log.info("Phiếu nhập kho {} đã hoàn thành nhập kho", updated.getReceiptCode());
        return importReceiptMapper.toResponse(updated);
    }

    @Transactional
    @PreAuthorize("hasRole('SELLER')")
    public ImportReceiptResponse cancelReceipt(Long id) {
        User currentUser = getCurrentUser();
        Shop shop = shopRepository.findBySellerId(currentUser.getId());
        if (shop == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        ImportReceipt receipt = importReceiptRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!receipt.getShop().getId().equals(shop.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (receipt.getStatus() != ImportReceiptStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        receipt.setStatus(ImportReceiptStatus.CANCELLED);
        ImportReceipt updated = importReceiptRepository.save(receipt);

        log.info("Phiếu nhập kho {} đã bị hủy", updated.getReceiptCode());
        return importReceiptMapper.toResponse(updated);
    }

    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ImportReceiptResponse getReceiptById(Long id) {
        User currentUser = getCurrentUser();
        ImportReceipt receipt = importReceiptRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));
        boolean isOwner = receipt.getShop().getSeller().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return importReceiptMapper.toResponse(receipt);
    }

    @PreAuthorize("hasRole('SELLER')")
    public PageResponse<ImportReceiptResponse> getMyReceipts(int page, int size, ImportReceiptStatus status, Long productId) {
        User currentUser = getCurrentUser();
        Shop shop = shopRepository.findBySellerId(currentUser.getId());
        if (shop == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<ImportReceipt> receiptPage;

        if (productId != null && status != null) {
            receiptPage = importReceiptRepository.findByShopIdAndProductIdAndStatus(shop.getId(), productId, status, pageable);
        } else if (productId != null) {
            receiptPage = importReceiptRepository.findByShopIdAndProductId(shop.getId(), productId, pageable);
        } else if (status != null) {
            receiptPage = importReceiptRepository.findByShopIdAndStatus(shop.getId(), status, pageable);
        } else {
            receiptPage = importReceiptRepository.findByShopId(shop.getId(), pageable);
        }

        List<ImportReceiptResponse> content = importReceiptMapper.toResponses(receiptPage.getContent());
        return PageResponse.of(receiptPage, content);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }
}
