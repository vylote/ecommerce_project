package com.vlt.ecommerce.feature.product.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        // Upload ảnh trực tiếp bằng mảng byte từ file tải lên
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,          // Tổ chức thư mục lưu trữ trên Cloudinary (vd: 'products')
                "resource_type", "auto"    // Tự động nhận diện định dạng (jpg, png, webp...)
        ));
        
        // Trả về link URL bảo mật (secure_url) do Cloudinary cung cấp
        return uploadResult.get("secure_url").toString();
    }
}
