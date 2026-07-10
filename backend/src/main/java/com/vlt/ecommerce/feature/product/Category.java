package com.vlt.ecommerce.feature.product;

import java.util.List;

import com.vlt.ecommerce.feature.commission.CommissionConfig;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @Column(nullable = false, length = 150)
    String name;
    @Column(nullable = false, length = 150, unique = true)
    String slug;
    /* ==============================================================================
     * VẾ CHỦ ĐỘNG (NGƯỜI CON NHÌN LÊN CHA) - QUYẾT ĐỊNH QUAN HỆ
     * ==============================================================================
     * - Đây là nơi GHI dữ liệu: Trực tiếp quản lý cột khóa ngoại 'parent_id' dưới DB.
     * - Khi tạo Danh mục con, nó chủ động set 'parent_id', từ đó Người Cha tự khắc có con.
     * - FetchType.LAZY: Bắt buộc phải có để chặn truy vấn N+1 dây chuyền (Con gọi Cha, 
     * Cha gọi Ông...). Hibernate chỉ nhét 1 Kẻ đóng thế (Proxy) vào đây.
     */
    @ManyToOne(fetch = FetchType.LAZY) //tránh N+1
    @JoinColumn(name = "parent_id")
    Category parent; 
    /* ==============================================================================
     * VẾ BỊ ĐỘNG (NGƯỜI CHA NHÌN XUỐNG CON) - ÁNH XẠ DỮ LIỆU
     * ==============================================================================
     * - DB "phẳng" không lưu được List. Đây chỉ là biến ảo trên RAM để OOP dễ thao tác.
     * - Không cần ghi LAZY vì @OneToMany mặc định đã là LAZY.
     * - mappedBy = "parent": Chỉ thị cho Hibernate đi quét bảng categories, tìm những 
     * đứa nào mà biến 'parent' của nó ĐANG TRỎ VỀ 'id' của chính mình, rồi gom tụi 
     * nó lại thành cái danh sách List này.
     */
    @OneToMany(mappedBy = "parent") 
    List<Category> children; // 
    @Column(name = "image_url", length = 500)
    String imageUrl;
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    Boolean isActive = true;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<Product> products;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<CommissionConfig> configs;

    @Version
    @Column(name = "version")
    Long version;
}