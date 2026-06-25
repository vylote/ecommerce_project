package com.vlt.ecommerce.feature.user.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vlt.ecommerce.feature.user.User;

public interface UserRepository extends JpaRepository<User, Long>{
    Boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);

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
