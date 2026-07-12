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
                "folder", folder, // Tổ chức thư mục lưu trữ trên Cloudinary (vd: 'products')
                "resource_type", "auto" // Tự động nhận diện định dạng (jpg, png, webp...)
        ));

        return uploadResult.get("secure_url").toString();
    }

    public void deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            System.err.println("Không thể xóa ảnh cũ trên Cloudinary với ID: " + publicId + ". Lỗi: " + e.getMessage());
        }
    }

    public String extractPublicIdFromUrl(String secureUrl) {
        if (secureUrl == null || !secureUrl.contains("/upload/"))
            return null;
        try {
            String[] parts = secureUrl.split("/upload/");
            if (parts.length < 2)
                return null;
            String remaining = parts[1];
            // 2. Bỏ phần số phiên bản (ví dụ: "v1783092233/") nếu có xuất hiện
            if (remaining.startsWith("v")) {
                int firstSlashIndex = remaining.indexOf("/");
                if (firstSlashIndex != -1) {
                    remaining = remaining.substring(firstSlashIndex + 1);
                }
            }

            int lastDotIndex = remaining.lastIndexOf(".");
            if (lastDotIndex != -1) {
                remaining = remaining.substring(0, lastDotIndex);
            }

            return remaining;
        } catch (Exception e) {
            return null;
        }
    }
}
