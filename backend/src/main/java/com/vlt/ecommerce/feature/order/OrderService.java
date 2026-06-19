package com.vlt.ecommerce.feature.order;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vlt.ecommerce.common.exception.AppException;
import com.vlt.ecommerce.common.exception.ErrorCode;
import com.vlt.ecommerce.feature.cart.CartItem;
import com.vlt.ecommerce.feature.cart.CartItemRepository;
import com.vlt.ecommerce.feature.order.dto.response.OrderResponse;
import com.vlt.ecommerce.feature.product.Product;
import com.vlt.ecommerce.feature.user.Address;
import com.vlt.ecommerce.feature.user.User;
import com.vlt.ecommerce.feature.user.dto.response.AddressResponse;
import com.vlt.ecommerce.feature.user.mapper.AddressMapper;
import com.vlt.ecommerce.feature.user.repository.AddressRepository;
import com.vlt.ecommerce.feature.user.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class OrderService {
    OrderRepository orderRepository;
    CartItemRepository cartItemRepository;
    UserRepository userRepository;
    AddressRepository addressRepository;
    AddressMapper addressMapper; 
    OrderMapper orderMapper;
    ObjectMapper objectMapper;

    @PreAuthorize("hasRole('BUYER')")
    @Transactional
    public OrderResponse create(OrderRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User buyer = userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        List<CartItem> cartItems = cartItemRepository.findByBuyerId(buyer.getId());
        if (cartItems.isEmpty()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        Address address = addressRepository.findById(request.getAddressId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!address.getUser().getId().equals(buyer.getId())) {
            throw new RuntimeException("Địa chỉ không hợp lệ!");
        }    

        //convert string addreson json
        String addressSnapshot;
        try {
            AddressResponse addressDto = addressMapper.toAddressResponse(address);
            addressSnapshot = objectMapper.writeValueAsString(addressDto);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi hệ thống khi xử lý địa chỉ giao hàng!");
        }

        Order newOrder = orderMapper.toOrder(request);
        newOrder.setBuyer(buyer);
        newOrder.setAddressSnapshot(addressSnapshot);
        newOrder.setNote(request.getNote());
        newOrder.setItems(new ArrayList<>());
        newOrder.setTotalAmount(BigDecimal.ZERO);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem :cartItems) {
            Product product = cartItem.getProduct();
            int orderQuantity = cartItem.getQuantity();

            if (product.getStockQuantity() < orderQuantity) {
                throw new RuntimeException(String.format(
                    "Lỗi tồn kho! Sản phẩm ID: %d (Tên: %s). Tồn kho DB đang đọc được: %d, Khách mua: %d", 
                    product.getId(), product.getName(), product.getStockQuantity(), orderQuantity
                ));
            }
            product.setStockQuantity(product.getStockQuantity()-orderQuantity);
            product.setSoldCount(product.getSoldCount()+orderQuantity);

            BigDecimal itemTotalPrice = product.getPrice().multiply(BigDecimal.valueOf(orderQuantity));
            
            OrderItem orderItem = OrderItem.builder()
                    .order(newOrder)
                    .product(product)
                    .shop(product.getShop())
                    .productName(product.getName())
                    .productPrice(product.getPrice())
                    .quantity(orderQuantity)
                    .totalPrice(itemTotalPrice)
                    .build();

            newOrder.getItems().add(orderItem);
            totalAmount = totalAmount.add(itemTotalPrice);
        }

        newOrder.setTotalAmount(totalAmount);
        cartItemRepository.deleteAllByBuyerId(buyer.getId());
        return orderMapper.toOrderResponse(orderRepository.save(newOrder));
    }    

    
}
