package com.vlt.ecommerce.integration.cloudinary;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryService implements ImageStorageService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        Map<?,?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto"
        ));

        return uploadResult.get("secure_url").toString();
    }

    @Override
    public void deleteByUrl(String imageUrl) {
        String publicId = extractPublicIdFromUrl(imageUrl);
        if (publicId == null) {
            return;
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            System.err.println("Không thể xóa ảnh cũ trên Cloudinary với ID: " + publicId + ". Lỗi: " + e.getMessage());
        }
    }

    private String extractPublicIdFromUrl(String secureUrl) {
        if (secureUrl == null || !secureUrl.contains("/upload/"))
            return null;
        try {
            String[] parts = secureUrl.split("/upload/");
            if (parts.length < 2)
                return null;
            String remaining = parts[1];
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
