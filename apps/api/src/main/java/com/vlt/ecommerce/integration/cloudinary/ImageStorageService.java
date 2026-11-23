package com.vlt.ecommerce.integration.cloudinary;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    String uploadFile(MultipartFile file, String folder) throws IOException;

    void deleteByUrl(String imageUrl);
}
