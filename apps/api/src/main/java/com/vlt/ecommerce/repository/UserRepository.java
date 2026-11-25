package com.vlt.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vlt.ecommerce.domain.User;

import jakarta.persistence.LockModeType;

public interface UserRepository extends JpaRepository<User, Long>{
    Boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    Boolean existsByPhone(String phone);

    Optional<User> findByEmailOrPhone(String email, String phone);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.id = :userId")
    Optional<User> findByIdForUpdate(@Param("userId") Long userId);

    @Query("SELECT u.id FROM User u JOIN u.roles r WHERE r.id = :roleId ORDER BY u.id")
    List<Long> findUserIdsByRoleId(@Param("roleId") Long roleId);

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
