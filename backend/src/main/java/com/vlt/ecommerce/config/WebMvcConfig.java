package com.vlt.ecommerce.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.PostConstruct;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Cấu hình chuẩn Classpath như bạn yêu cầu
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
    }

    // Hàm này sẽ tự động chạy 1 lần duy nhất khi khởi động Server
    @PostConstruct
    public void diagnosticCheck() {
        System.out.println("\n========== BẮT ĐẦU DÒ TÌM ẢNH BẰNG CLASSPATH ==========");
        try {
            // Yêu cầu Java tìm thử đúng file bạn đang bị lỗi
            ClassPathResource resource = new ClassPathResource("static/images/categories/quanao.png");
            
            if (resource.exists()) {
                System.out.println("✅ [THÀNH CÔNG] ĐÃ TÌM THẤY ẢNH!");
                System.out.println("👉 Đường dẫn thực tế Java đang đọc: " + resource.getURL());
                System.out.println("-> Nếu trình duyệt vẫn 404, hãy xóa cache trình duyệt (Ctrl + F5).");
            } else {
                System.out.println("❌ [THẤT BẠI] KHÔNG TÌM THẤY ẢNH TRONG CLASSPATH!");
                System.out.println("👉 Mặc dù bạn đã bỏ ảnh vào thư mục 'src/main/resources/...', ");
                System.out.println("   nhưng VS Code CHƯA copy nó sang thư mục biên dịch 'target/classes/'.");
                System.out.println("🔧 CÁCH SỬA: Tắt Server -> Mở Terminal -> Gõ lệnh 'mvn clean compile' -> Bật lại Server.");
            }
        } catch (Exception e) {
            System.out.println("⚠️ [LỖI HỆ THỐNG]: " + e.getMessage());
        }
        System.out.println("=========================================================\n");
    }
}