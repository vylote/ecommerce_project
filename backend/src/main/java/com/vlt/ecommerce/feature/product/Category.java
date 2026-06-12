package com.vlt.ecommerce.feature.product;

import java.util.List;

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
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
    // quan hệ tự tham chiếu -danh mục cha
    @ManyToOne(fetch = FetchType.LAZY) //tránh N+1
    @JoinColumn(name = "parent_id")
    Category parent; //field
    //danh sách các danh mục con
    @OneToMany(mappedBy = "parent") // trỏ đến field k phải cột
    List<Category> children; // 
    @Column(name = "image_url", length = 500)
    String imageUrl;
    @Column(name = "is_active", nullable = false)
    Boolean isActive;
}

// bình thường khi SELECT * FROM categories WHERE id = 2 thì trả về đúng 1 dòng, nhưng JPA/Hibernate tự động query thêm vì nó cần tạo
// object đầy đủ, 
// kiểu Category {
//     id: 2,
//     name: "Điện thoại",
//     parent: ??? // ← JPA thấy field này, nó cần điền vào
// } 

// SELECT * FROM categories WHERE id = 2;
// SELECT * FROM categories WHERE id = 1;  -- lấy parent để điền vào field

// Với LAZY, JPA tạo proxy object — object giả, chưa có data:
// Category {
//     id: 2,
//     name: "Điện thoại",
//     parent: Proxy{id=1, data=CHƯA_LOAD}  // placeholder
// }
// // Query thêm CHỈ KHI bạn gọi .getParent().getName()