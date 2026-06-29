package com.vlt.ecommerce.feature.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserId(Long userId, Pageable pageable);

    long countByUserIdAndIsReadFalse(Long userId);

    /* mặc định jpa coi mọi @Query là lệnh đọc (SELECT) nên nếu thấy SQL bắt đầu bằng UPDATE, DELETE thì nó sẽ báo lỗi, khi thêm
    modify tức là đang kí xác nhận cáp quyền thay đổi dữ liệu */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsReadByUserId(@Param("userId") Long userId);
}
