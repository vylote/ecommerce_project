package com.vlt.ecommerce.integration.cloudinary;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    String uploadFile(MultipartFile file, String folder) throws IOException;

    /**
     * Attempts to remove a stored image. Missing or unrecognized URLs are ignored.
     */
    void deleteByUrl(String imageUrl);
}
