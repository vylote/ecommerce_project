package com.vlt.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vlt.ecommerce.domain.User;
import com.vlt.ecommerce.repository.projection.UserAuthorizationRole;

public interface UserRepository extends JpaRepository<User, Long>{
    Boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    Boolean existsByPhone(String phone);

    Optional<User> findByEmailOrPhone(String email, String phone);

    @Query(value = """
            SELECT ur.role_id AS roleId
            FROM users u
            LEFT JOIN user_roles ur ON ur.user_id = u.id
            WHERE u.id = :userId AND u.is_active = TRUE
            """, nativeQuery = true)
    List<UserAuthorizationRole> findAuthorizationRoles(@Param("userId") Long userId);

    @Query("SELECT u FROM User u WHERE "+
           "(:email IS NULL OR u.email LIKE CONCAT('%', :email, '%')) AND"+ 
           "(:fullName IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))) AND"+ 
           "(:phone IS NULL OR u.phone LIKE CONCAT('%', :phone, '%'))")
    Page<User> filterUsers(
        @Param("email") String email,
        @Param("fullName") String fullName,
        @Param("phone") String phone,
        Pageable pageable
    );
}
