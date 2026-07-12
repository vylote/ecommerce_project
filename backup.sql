-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: ecommerce_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `detail` varchar(500) NOT NULL,
  `district` varchar(100) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `is_default` bit(1) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `province` varchar(100) NOT NULL,
  `ward` varchar(100) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1fa36y2oqhao3wgg2rw1pi459` (`user_id`),
  CONSTRAINT `FK1fa36y2oqhao3wgg2rw1pi459` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (2,'39 ngo cho','Soc Son','Le Thanh Vy',_binary '\0','0999999999','Ha Noi','Phu Lo',4),(3,'2501 nha tho','Soc Son','buyer1',_binary '','3248204334','Ha Noi','Phu Lo',3),(4,'em khong la nang tho','Soc Son','buyer2',_binary '','0888877770','Ha Noi','Phu Lo',4);
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `added_at` datetime(6) NOT NULL,
  `quantity` int NOT NULL,
  `buyer_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6tm4qp6axjbqut41coeosgjb7` (`buyer_id`,`product_id`),
  KEY `FK1re40cjegsfvw58xrkdp6bac6` (`product_id`),
  CONSTRAINT `FK1re40cjegsfvw58xrkdp6bac6` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKqcfl3rdls766o76a23bdv2bvt` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (38,'2026-07-11 19:36:01.000000',1,4,61);
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `version` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKoul14ho7bctbefv8jywp5v3i2` (`slug`),
  KEY `FKsaok720gsu4u2wrgbk10b5n8d` (`parent_id`),
  CONSTRAINT `FKsaok720gsu4u2wrgbk10b5n8d` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (8,'men-clothes.png',_binary '','Men Clothes','men-clothes',NULL,0),(9,'mobile-gadgets.png',_binary '','Mobile & Gadgets','mobile-gadgets',NULL,0),(10,'consumer-electronics.png',_binary '','Consumer Electronics','consumer-electronics',NULL,0),(11,'computer-accessories.png',_binary '','Computer & Accessories','computer-accessories',NULL,0),(12,'cameras.png',_binary '','Cameras','cameras',NULL,0),(13,'watches.png',_binary '','Watches','watches',NULL,0),(14,'men-shoes.png',_binary '','Men Shoes','men-shoes',NULL,0),(15,'home-appliances.png',_binary '','Home Appliances','home-appliances',NULL,0),(16,'sport-outdoor.png',_binary '','Sport & Outdoor','sport-outdoor',NULL,0),(17,'automotive.png',_binary '','Automotive','automotive',NULL,0),(18,'women-clothes.png',_binary '','Women Clothes','women-clothes',NULL,0),(19,'moms-kids-babies.png',_binary '','Moms, Kids & Babies','moms-kids-babies',NULL,0),(20,'home-living.png',_binary '','Home & Living','home-living',NULL,0),(21,'beauty.png',_binary '','Beauty','beauty',NULL,0),(22,'health.png',_binary '','Health','health',NULL,0),(23,'women-shoes.png',_binary '','Women Shoes','women-shoes',NULL,0),(24,'women-bags.png',_binary '','Women Bags','women-bags',NULL,0),(25,'fashion-accessories.png',_binary '','Fashion Accessories','fashion-accessories',NULL,0),(26,'grocery.png',_binary '','Grocery','grocery',NULL,0),(27,'books-stationery.png',_binary '','Books & Stationery','books-stationery',NULL,0),(28,'men-bags.png',_binary '','Men Bags','men-bags',NULL,0),(29,'toys.png',_binary '','Toys','toys',NULL,0),(30,'pets.png',_binary '','Pets','pets',NULL,0),(31,'tools-home-improvement.png',_binary '','Tools & Home Improvement','tools-home-improvement',NULL,0),(32,'kid-fashion.png',_binary '','Kid Fashion','kid-fashion',NULL,0),(33,'home-care.png',_binary '','Home care','home-care',NULL,0),(34,'tickets-vouchers-services.png',_binary '','Tickets, Vouchers & Services','tickets-vouchers-services',NULL,0),(35,'men-clothes-tshirt.png',_binary '','Áo Thun Nam','men-clothes-tshirt',8,0),(36,'men-clothes-shirt.png',_binary '','Áo Sơ Mi Nam','men-clothes-shirt',8,0),(37,'men-clothes-jeans.png',_binary '','Quần Jean Nam','men-clothes-jeans',8,0),(38,'men-clothes-shorts.png',_binary '','Quần Short Nam','men-clothes-shorts',8,0),(39,'mobile-phones.png',_binary '','Điện Thoại','mobile-phones',9,0),(40,'mobile-cases.png',_binary '','Ốp Lưng - Bao Da','mobile-cases',9,0),(41,'mobile-chargers.png',_binary '','Sạc - Cáp Sạc','mobile-chargers',9,0),(42,'mobile-powerbank.png',_binary '','Sạc Dự Phòng','mobile-powerbank',9,0),(43,'electronics-headphones.png',_binary '','Tai Nghe','electronics-headphones',10,0),(44,'electronics-speakers.png',_binary '','Loa','electronics-speakers',10,0),(45,'electronics-tv.png',_binary '','Tivi','electronics-tv',10,0),(46,'computer-laptop.png',_binary '','Laptop','computer-laptop',11,0),(47,'computer-keyboard.png',_binary '','Bàn Phím','computer-keyboard',11,0),(48,'computer-mouse.png',_binary '','Chuột','computer-mouse',11,0),(49,'computer-storage.png',_binary '','Ổ Cứng - USB','computer-storage',11,0),(50,'camera-dslr.png',_binary '','Máy Ảnh DSLR','camera-dslr',12,0),(51,'camera-action.png',_binary '','Camera Hành Động','camera-action',12,0),(52,'camera-accessories.png',_binary '','Phụ Kiện Máy Ảnh','camera-accessories',12,0),(53,'watches-men.png',_binary '','Đồng Hồ Nam','watches-men',13,0),(54,'watches-women.png',_binary '','Đồng Hồ Nữ','watches-women',13,0),(55,'watches-smart.png',_binary '','Đồng Hồ Thông Minh','watches-smart',13,0),(56,'men-shoes-sneaker.png',_binary '','Giày Sneaker Nam','men-shoes-sneaker',14,0),(57,'men-shoes-leather.png',_binary '','Giày Tây Nam','men-shoes-leather',14,0),(58,'men-shoes-sandal.png',_binary '','Dép - Sandal Nam','men-shoes-sandal',14,0),(59,'appliances-kitchen.png',_binary '','Đồ Gia Dụng Nhà Bếp','appliances-kitchen',15,0),(60,'appliances-cleaning.png',_binary '','Thiết Bị Vệ Sinh','appliances-cleaning',15,0),(61,'appliances-cooling.png',_binary '','Quạt - Máy Lạnh','appliances-cooling',15,0),(62,'sport-gym.png',_binary '','Dụng Cụ Gym','sport-gym',16,0),(63,'sport-camping.png',_binary '','Đồ Cắm Trại','sport-camping',16,0),(64,'sport-cycling.png',_binary '','Xe Đạp - Phụ Kiện','sport-cycling',16,0),(65,'automotive-accessories.png',_binary '','Phụ Kiện Ô Tô','automotive-accessories',17,0),(66,'automotive-motorbike.png',_binary '','Phụ Kiện Xe Máy','automotive-motorbike',17,0),(67,'automotive-tools.png',_binary '','Dụng Cụ Sửa Xe','automotive-tools',17,0),(68,'women-clothes-dress.png',_binary '','Váy Đầm','women-clothes-dress',18,0),(69,'women-clothes-shirt.png',_binary '','Áo Kiểu Nữ','women-clothes-shirt',18,0),(70,'women-clothes-pants.png',_binary '','Quần Nữ','women-clothes-pants',18,0),(71,'baby-stroller.png',_binary '','Xe Đẩy - Nôi','baby-stroller',19,0),(72,'baby-feeding.png',_binary '','Đồ Ăn Dặm','baby-feeding',19,0),(73,'baby-diapers.png',_binary '','Tã - Bỉm','baby-diapers',19,0),(74,'home-bedding.png',_binary '','Chăn Ga Gối','home-bedding',20,0),(75,'home-decor.png',_binary '','Đồ Trang Trí','home-decor',20,0),(76,'home-storage.png',_binary '','Kệ - Tủ Lưu Trữ','home-storage',20,0),(77,'beauty-skincare.png',_binary '','Chăm Sóc Da','beauty-skincare',21,0),(78,'beauty-makeup.png',_binary '','Trang Điểm','beauty-makeup',21,0),(79,'beauty-haircare.png',_binary '','Chăm Sóc Tóc','beauty-haircare',21,0),(80,'health-supplements.png',_binary '','Thực Phẩm Chức Năng','health-supplements',22,0),(81,'health-devices.png',_binary '','Thiết Bị Y Tế','health-devices',22,0),(82,'health-massage.png',_binary '','Máy Massage','health-massage',22,0),(83,'women-shoes-heels.png',_binary '','Giày Cao Gót','women-shoes-heels',23,0),(84,'women-shoes-flats.png',_binary '','Giày Búp Bê','women-shoes-flats',23,0),(85,'women-shoes-sandal.png',_binary '','Dép - Sandal Nữ','women-shoes-sandal',23,0),(86,'women-bags-tote.png',_binary '','Túi Tote','women-bags-tote',24,0),(87,'women-bags-shoulder.png',_binary '','Túi Đeo Vai','women-bags-shoulder',24,0),(88,'women-bags-clutch.png',_binary '','Túi Cầm Tay','women-bags-clutch',24,0),(89,'accessories-jewelry.png',_binary '','Trang Sức','accessories-jewelry',25,0),(90,'accessories-glasses.png',_binary '','Kính Mắt','accessories-glasses',25,0),(91,'accessories-belt.png',_binary '','Thắt Lưng','accessories-belt',25,0),(92,'grocery-snacks.png',_binary '','Bánh Kẹo - Snack','grocery-snacks',26,0),(93,'grocery-beverages.png',_binary '','Đồ Uống','grocery-beverages',26,0),(94,'grocery-nuts.png',_binary '','Hạt Dinh Dưỡng','grocery-nuts',26,0),(95,'books-textbook.png',_binary '','Sách Học Tập','books-textbook',27,0),(96,'books-stationery-office.png',_binary '','Văn Phòng Phẩm','books-stationery-office',27,0),(97,'books-novel.png',_binary '','Truyện - Tiểu Thuyết','books-novel',27,0),(98,'men-bags-backpack.png',_binary '','Balo Nam','men-bags-backpack',28,0),(99,'men-bags-crossbody.png',_binary '','Túi Đeo Chéo Nam','men-bags-crossbody',28,0),(100,'men-bags-laptop.png',_binary '','Cặp Đựng Laptop','men-bags-laptop',28,0),(101,'toys-blocks.png',_binary '','Đồ Chơi Lắp Ráp','toys-blocks',29,0),(102,'toys-remote.png',_binary '','Xe Điều Khiển Từ Xa','toys-remote',29,0),(103,'toys-plush.png',_binary '','Thú Nhồi Bông','toys-plush',29,0),(104,'pets-food.png',_binary '','Thức Ăn Thú Cưng','pets-food',30,0),(105,'pets-accessories.png',_binary '','Phụ Kiện Thú Cưng','pets-accessories',30,0),(106,'pets-hygiene.png',_binary '','Vệ Sinh Thú Cưng','pets-hygiene',30,0),(107,'tools-hand.png',_binary '','Dụng Cụ Cầm Tay','tools-hand',31,0),(108,'tools-power.png',_binary '','Máy Khoan - Máy Cắt','tools-power',31,0),(109,'tools-hardware.png',_binary '','Phần Cứng - Ốc Vít','tools-hardware',31,0),(110,'kid-fashion-boy.png',_binary '','Thời Trang Bé Trai','kid-fashion-boy',32,0),(111,'kid-fashion-girl.png',_binary '','Thời Trang Bé Gái','kid-fashion-girl',32,0),(112,'kid-fashion-shoes.png',_binary '','Giày Dép Trẻ Em','kid-fashion-shoes',32,0),(113,'home-care-detergent.png',_binary '','Nước Giặt - Xả','home-care-detergent',33,0),(114,'home-care-cleaning.png',_binary '','Dụng Cụ Lau Dọn','home-care-cleaning',33,0),(115,'home-care-airfreshener.png',_binary '','Xịt Phòng - Khử Mùi','home-care-airfreshener',33,0),(116,'vouchers-topup.png',_binary '','Nạp Thẻ Điện Thoại','vouchers-topup',34,0),(117,'vouchers-cleaning.png',_binary '','Dịch Vụ Dọn Dẹp','vouchers-cleaning',34,0),(118,'vouchers-movie.png',_binary '','Vé Xem Phim','vouchers-movie',34,0);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commission_configs`
--

DROP TABLE IF EXISTS `commission_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commission_configs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `effective_from` date NOT NULL,
  `rate` decimal(5,4) NOT NULL,
  `category_id` bigint NOT NULL,
  `created_by` bigint NOT NULL,
  `version` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKt325qer2vut39rn83hhh82i6b` (`category_id`),
  KEY `FKcunqx6x73uqx3dq9aldp9smof` (`created_by`),
  CONSTRAINT `FK3hy3sea1w4l3s7vh8cojooj0m` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `FKcunqx6x73uqx3dq9aldp9smof` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=114 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commission_configs`
--

LOCK TABLES `commission_configs` WRITE;
/*!40000 ALTER TABLE `commission_configs` DISABLE KEYS */;
INSERT INTO `commission_configs` VALUES (2,'2026-06-22',0.1200,6,5,0),(3,'2026-07-04',0.0800,91,5,0),(4,'2026-07-04',0.0800,90,5,0),(5,'2026-07-04',0.0800,89,5,0),(6,'2026-07-04',0.0500,60,5,0),(7,'2026-07-04',0.0500,61,5,0),(8,'2026-07-04',0.0500,59,5,0),(9,'2026-07-04',0.0600,17,5,0),(10,'2026-07-04',0.0600,65,5,0),(11,'2026-07-04',0.0600,66,5,0),(12,'2026-07-04',0.0600,67,5,0),(13,'2026-07-04',0.0800,73,5,0),(14,'2026-07-04',0.0800,72,5,0),(15,'2026-07-04',0.0800,71,5,0),(16,'2026-07-04',0.1000,21,5,0),(17,'2026-07-04',0.1000,79,5,0),(18,'2026-07-04',0.1000,78,5,0),(19,'2026-07-04',0.1000,77,5,0),(20,'2026-07-04',0.0500,97,5,0),(21,'2026-07-04',0.0500,27,5,0),(22,'2026-07-04',0.0500,96,5,0),(23,'2026-07-04',0.0500,95,5,0),(24,'2026-07-04',0.0500,52,5,0),(25,'2026-07-04',0.0500,51,5,0),(26,'2026-07-04',0.0500,50,5,0),(27,'2026-07-04',0.0500,12,5,0),(28,'2026-07-04',0.0400,11,5,0),(29,'2026-07-04',0.0400,47,5,0),(30,'2026-07-04',0.0400,46,5,0),(31,'2026-07-04',0.0400,48,5,0),(32,'2026-07-04',0.0400,49,5,0),(33,'2026-07-04',0.0400,10,5,0),(34,'2026-07-04',0.0400,43,5,0),(35,'2026-07-04',0.0400,44,5,0),(36,'2026-07-04',0.0400,45,5,0),(37,'2026-07-04',0.0800,25,5,0),(38,'2026-07-04',0.0250,26,5,0),(39,'2026-07-04',0.0250,93,5,0),(40,'2026-07-04',0.0250,94,5,0),(41,'2026-07-04',0.0250,92,5,0),(42,'2026-07-04',0.0600,22,5,0),(43,'2026-07-04',0.0600,81,5,0),(44,'2026-07-04',0.0600,82,5,0),(45,'2026-07-04',0.0600,80,5,0),(46,'2026-07-04',0.0500,15,5,0),(47,'2026-07-04',0.0700,74,5,0),(48,'2026-07-04',0.0600,33,5,0),(49,'2026-07-04',0.0600,115,5,0),(50,'2026-07-04',0.0600,114,5,0),(51,'2026-07-04',0.0600,113,5,0),(52,'2026-07-04',0.0700,75,5,0),(53,'2026-07-04',0.0700,20,5,0),(54,'2026-07-04',0.0700,76,5,0),(55,'2026-07-04',0.1000,32,5,0),(56,'2026-07-04',0.1000,110,5,0),(57,'2026-07-04',0.1000,111,5,0),(58,'2026-07-04',0.1000,112,5,0),(59,'2026-07-04',0.0900,28,5,0),(60,'2026-07-04',0.0900,98,5,0),(61,'2026-07-04',0.0900,99,5,0),(62,'2026-07-04',0.0900,100,5,0),(63,'2026-07-04',0.1000,8,5,0),(64,'2026-07-04',0.1000,37,5,0),(65,'2026-07-04',0.1000,36,5,0),(66,'2026-07-04',0.1000,38,5,0),(67,'2026-07-04',0.1000,35,5,0),(68,'2026-07-04',0.0900,14,5,0),(69,'2026-07-04',0.0900,57,5,0),(70,'2026-07-04',0.0900,58,5,0),(71,'2026-07-04',0.0900,56,5,0),(72,'2026-07-04',0.0300,40,5,0),(73,'2026-07-04',0.0300,41,5,0),(74,'2026-07-04',0.0300,9,5,0),(75,'2026-07-04',0.0300,39,5,0),(76,'2026-07-04',0.0300,42,5,0),(77,'2026-07-04',0.0800,19,5,0),(78,'2026-07-04',0.0700,30,5,0),(79,'2026-07-04',0.0700,105,5,0),(80,'2026-07-04',0.0700,104,5,0),(81,'2026-07-04',0.0700,106,5,0),(82,'2026-07-04',0.0700,63,5,0),(83,'2026-07-04',0.0700,64,5,0),(84,'2026-07-04',0.0700,62,5,0),(85,'2026-07-04',0.0700,16,5,0),(86,'2026-07-04',0.0200,34,5,0),(87,'2026-07-04',0.0500,107,5,0),(88,'2026-07-04',0.0500,109,5,0),(89,'2026-07-04',0.0500,31,5,0),(90,'2026-07-04',0.0500,108,5,0),(91,'2026-07-04',0.0800,29,5,0),(92,'2026-07-04',0.0800,101,5,0),(93,'2026-07-04',0.0800,103,5,0),(94,'2026-07-04',0.0800,102,5,0),(95,'2026-07-04',0.0200,117,5,0),(96,'2026-07-04',0.0200,118,5,0),(97,'2026-07-04',0.0200,116,5,0),(98,'2026-07-04',0.0700,13,5,0),(99,'2026-07-04',0.0700,53,5,0),(100,'2026-07-04',0.0700,55,5,0),(101,'2026-07-04',0.0700,54,5,0),(102,'2026-07-04',0.0900,24,5,0),(103,'2026-07-04',0.0900,88,5,0),(104,'2026-07-04',0.0900,87,5,0),(105,'2026-07-04',0.0900,86,5,0),(106,'2026-07-04',0.1000,18,5,0),(107,'2026-07-04',0.1000,68,5,0),(108,'2026-07-04',0.1000,70,5,0),(109,'2026-07-04',0.1000,69,5,0),(110,'2026-07-04',0.0900,23,5,0),(111,'2026-07-04',0.0900,84,5,0),(112,'2026-07-04',0.0900,83,5,0),(113,'2026-07-04',0.0900,85,5,0);
/*!40000 ALTER TABLE `commission_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commission_records`
--

DROP TABLE IF EXISTS `commission_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commission_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `commission_amount` decimal(15,2) NOT NULL,
  `commission_rate` decimal(5,4) NOT NULL,
  `item_revenue` decimal(15,2) NOT NULL,
  `net_revenue` decimal(15,2) NOT NULL,
  `recorded_at` datetime(6) NOT NULL,
  `order_id` bigint NOT NULL,
  `order_item_id` bigint NOT NULL,
  `seller_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7y4x85dop5crmaw9off3rshtk` (`order_id`),
  KEY `FKk7vtaqgfqf1l6syi4eypeiqd8` (`order_item_id`),
  KEY `FK334ayov1p01v772wd9yqdpcpo` (`seller_id`),
  CONSTRAINT `FK334ayov1p01v772wd9yqdpcpo` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK7y4x85dop5crmaw9off3rshtk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKk7vtaqgfqf1l6syi4eypeiqd8` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commission_records`
--

LOCK TABLES `commission_records` WRITE;
/*!40000 ALTER TABLE `commission_records` DISABLE KEYS */;
INSERT INTO `commission_records` VALUES (1,600001.20,0.1200,5000010.00,4400008.80,'2026-06-22 05:18:38.038155',1,1,2),(2,1602664.80,0.1200,13355540.00,11752875.20,'2026-06-25 13:19:06.169338',2,2,1),(3,801332.40,0.1200,6677770.00,5876437.60,'2026-06-26 04:57:27.287370',7,7,1),(4,801332.40,0.1200,6677770.00,5876437.60,'2026-06-26 05:09:22.408487',7,7,1),(5,801332.40,0.1200,6677770.00,5876437.60,'2026-06-26 05:15:09.616362',7,7,1),(6,801332.40,0.1200,6677770.00,5876437.60,'2026-06-26 05:21:36.819028',7,7,1),(7,801332.40,0.1200,6677770.00,5876437.60,'2026-06-26 05:31:30.919913',7,7,1),(8,801332.40,0.1200,6677770.00,5876437.60,'2026-06-26 05:36:20.256138',7,7,1),(9,801332.40,0.1200,6677770.00,5876437.60,'2026-06-26 05:40:11.251340',7,7,1),(10,75000.00,0.1000,750000.00,675000.00,'2026-07-04 08:43:02.757100',9,9,2),(11,75000.00,0.1000,750000.00,675000.00,'2026-07-06 15:11:11.877626',10,10,26);
/*!40000 ALTER TABLE `commission_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_read` bit(1) NOT NULL,
  `message` text NOT NULL,
  `ref_id` bigint DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `type` varchar(50) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (9,'2026-06-26 05:36:20.439114',_binary '\0','Đơn hàng #7 đã giao thành công. Doanh thu đã được cộng vào ví.',7,'Giao dịch hoàn tất','ORDER_COMPLETED',1),(10,'2026-06-26 05:40:11.417344',_binary '\0','Đơn hàng #7 đã giao thành công. Doanh thu đã được cộng vào ví.',7,'Giao dịch hoàn tất','ORDER_COMPLETED',1),(11,'2026-06-29 03:03:59.235127',_binary '\0','Bạn vừa nhận được đơn hàng mới #8. Hãy chuẩn bị sẵn sàng khi khách thanh toán nhé!',8,'Đơn hàng mới 🚀','NEW_ORDER',2),(12,'2026-06-29 03:07:06.646342',_binary '\0','Đơn hàng #8 đã bị khách hàng hủy. Đã hoàn lại tồn kho.',8,'Khách hàng hủy đơn','ORDER_CANCELLED',2),(13,'2026-07-04 08:15:41.169050',_binary '\0','Bạn vừa nhận được đơn hàng mới #9. Hãy chuẩn bị sẵn sàng khi khách thanh toán nhé!',9,'Đơn hàng mới 🚀','NEW_ORDER',2),(14,'2026-07-04 08:22:02.657346',_binary '\0','Ting ting! Đơn hàng #9 (PENDING) đã được thanh toán. Bạn có thể an tâm xác nhận đơn và đóng gói!',9,'Đơn hàng đã thanh toán','PAYMENT_SUCCESS',2),(15,'2026-07-04 08:22:46.827554',_binary '\0','Shop đã xác nhận đơn hàng #9 của bạn và đang đóng gói.',9,'Đơn hàng đã được xác nhận','ORDER_CONFIRMED',3),(16,'2026-07-04 08:23:04.396061',_binary '\0','Đơn hàng #9 đã được giao cho đơn vị vận chuyển.',9,'Đơn hàng đang giao','ORDER_SHIPPING',3),(17,'2026-07-04 08:43:02.802239',_binary '\0','Đơn hàng #9 đã giao thành công. Doanh thu đã được cộng vào ví.',9,'Giao dịch hoàn tất','ORDER_COMPLETED',2),(18,'2026-07-06 15:01:28.867046',_binary '\0','Bạn vừa nhận được đơn hàng mới #10. Hãy chuẩn bị sẵn sàng khi khách thanh toán nhé!',10,'Đơn hàng mới 🚀','NEW_ORDER',26),(19,'2026-07-06 15:02:17.426904',_binary '\0','Ting ting! Đơn hàng #10 (PENDING) đã được thanh toán. Bạn có thể an tâm xác nhận đơn và đóng gói!',10,'Đơn hàng đã thanh toán','PAYMENT_SUCCESS',26),(20,'2026-07-06 15:05:30.995557',_binary '\0','Shop đã xác nhận đơn hàng #10 của bạn và đang đóng gói.',10,'Đơn hàng đã được xác nhận','ORDER_CONFIRMED',4),(21,'2026-07-06 15:05:40.722738',_binary '\0','Đơn hàng #10 đã được giao cho đơn vị vận chuyển.',10,'Đơn hàng đang giao','ORDER_SHIPPING',4),(22,'2026-07-06 15:11:11.938399',_binary '\0','Đơn hàng #10 đã giao thành công. Doanh thu đã được cộng vào ví.',10,'Giao dịch hoàn tất','ORDER_COMPLETED',26),(23,'2026-07-11 16:35:59.887095',_binary '\0','Bạn vừa nhận được đơn hàng mới #11. Hãy chuẩn bị sẵn sàng khi khách thanh toán nhé!',11,'Đơn hàng mới 🚀','NEW_ORDER',28),(24,'2026-07-11 16:35:59.906730',_binary '\0','Bạn vừa nhận được đơn hàng mới #12. Hãy chuẩn bị sẵn sàng khi khách thanh toán nhé!',12,'Đơn hàng mới 🚀','NEW_ORDER',28),(25,'2026-07-11 17:03:00.484310',_binary '\0','Bạn vừa nhận được đơn hàng mới #13. Hãy chuẩn bị sẵn sàng khi khách thanh toán nhé!',13,'Đơn hàng mới 🚀','NEW_ORDER',28),(26,'2026-07-11 17:03:47.358922',_binary '\0','Bạn vừa nhận được đơn hàng mới #14. Hãy chuẩn bị sẵn sàng khi khách thanh toán nhé!',14,'Đơn hàng mới 🚀','NEW_ORDER',28),(27,'2026-07-11 17:18:44.265564',_binary '\0','Bạn vừa nhận được đơn hàng mới #15. Hãy chuẩn bị sẵn sàng khi khách thanh toán nhé!',15,'Đơn hàng mới 🚀','NEW_ORDER',28),(28,'2026-07-11 21:14:06.270380',_binary '\0','Bạn vừa nhận được đơn hàng mới #17. Hãy chuẩn bị sẵn sàng khi khách thanh toán nhé!',17,'Đơn hàng mới 🚀','NEW_ORDER',32),(29,'2026-07-11 21:14:06.270380',_binary '\0','Bạn vừa nhận được đơn hàng mới #18. Hãy chuẩn bị sẵn sàng khi khách thanh toán nhé!',18,'Đơn hàng mới 🚀','NEW_ORDER',33),(30,'2026-07-12 02:33:48.985158',_binary '\0','Bạn vừa nhận được đơn hàng mới #19. Hãy chuẩn bị sẵn sàng khi khách thanh toán nhé!',19,'Đơn hàng mới 🚀','NEW_ORDER',30),(31,'2026-07-12 02:37:53.936492',_binary '\0','Bạn vừa nhận được đơn hàng mới #20. Hãy chuẩn bị sẵn sàng khi khách thanh toán nhé!',20,'Đơn hàng mới 🚀','NEW_ORDER',32),(32,'2026-07-12 02:47:41.794500',_binary '\0','Đơn hàng #20 đã bị khách hàng hủy. Đã hoàn lại tồn kho.',20,'Khách hàng hủy đơn','ORDER_CANCELLED',32);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_name` varchar(500) NOT NULL,
  `product_price` decimal(15,2) NOT NULL,
  `quantity` int NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `shop_id` bigint NOT NULL,
  `product_image_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`),
  KEY `FKocimc7dtr037rh4ls4l95nlfi` (`product_id`),
  KEY `FK1iyu6dct493xc5al3u9x3mds4` (`shop_id`),
  CONSTRAINT `FK1iyu6dct493xc5al3u9x3mds4` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`),
  CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKocimc7dtr037rh4ls4l95nlfi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,'durex',250000.50,20,5000010.00,1,1,1,NULL),(2,'kẹo sữa mikita',667777.00,20,13355540.00,2,4,2,NULL),(3,'kẹo sữa mikita',667777.00,15,10016655.00,3,4,2,NULL),(7,'kẹo sữa mikita',667777.00,10,6677770.00,7,4,2,NULL),(8,'durex',250000.50,10,2500005.00,8,1,1,NULL),(9,'Áo thun nam thể thao M1',150000.00,5,750000.00,9,61,1,NULL),(10,'Áo thun nam thể thao M1',150000.00,5,750000.00,10,61,3,NULL),(11,'Ốp lưng chống sốc iPhone 15',120000.00,1,120000.00,11,63,5,NULL),(12,'Ốp lưng chống sốc iPhone 15',120000.00,1,120000.00,12,63,5,NULL),(13,'Ốp lưng chống sốc iPhone 15',120000.00,1,120000.00,13,63,5,NULL),(14,'Ốp lưng chống sốc iPhone 15',120000.00,1,120000.00,14,63,5,NULL),(15,'Ốp lưng chống sốc iPhone 15',120000.00,1,120000.00,15,63,5,NULL),(16,'Hạt mắc ca sấy nứt vỏ',180000.00,4,720000.00,17,97,9,NULL),(17,'Cà phê rang xay nguyên chất',150000.00,1,150000.00,18,98,10,NULL),(18,'Kính mát chống tia UV',250000.00,6,1500000.00,19,95,7,NULL),(19,'Hạt mắc ca sấy nứt vỏ',180000.00,2,360000.00,20,97,9,'https://res.cloudinary.com/dkw6t0xuc/image/upload/v1783092233/ecommerce/products/mtyki6hlraetbcrxvlpg.jpg');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address_snapshot` text NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `note` varchar(500) DEFAULT NULL,
  `status` enum('CANCELLED','COMPLETED','CONFIRMED','PENDING','SHIPPING') NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `buyer_id` bigint NOT NULL,
  `shop_id` bigint NOT NULL,
  `idempotency_key` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKd1kkvl4hi9hp3peub1umk2xeo` (`idempotency_key`),
  KEY `FKhtx3insd5ge6w486omk4fnk54` (`buyer_id`),
  KEY `FK21gttsw5evi5bbsvleui69d7r` (`shop_id`),
  CONSTRAINT `FK21gttsw5evi5bbsvleui69d7r` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`),
  CONSTRAINT `FKhtx3insd5ge6w486omk4fnk54` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (20,'{\"id\":4,\"userId\":4,\"fullName\":\"buyer2\",\"phone\":\"0888877770\",\"province\":\"Ha Noi\",\"district\":\"Soc Son\",\"ward\":\"Phu Lo\",\"detail\":\"em khong la nang tho\",\"isDefault\":true}','2026-07-12 02:37:53.898357',NULL,'CANCELLED',360000.00,'2026-07-12 02:47:41.716159',4,9,'623a8a40-df79-47a1-bfdc-827d6739e9da-shop9');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(15,2) NOT NULL,
  `method` enum('BANK_TRANSFER','COD','MOCK_ONLINE') NOT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `status` enum('FAILED','PAID','PENDING','REFUNDED') NOT NULL,
  `transaction_ref` varchar(200) DEFAULT NULL,
  `order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK8vo36cen604as7etdfwmyjsxt` (`order_id`),
  CONSTRAINT `FK81gagumt0r8y3rmudcgpbk42l` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,5000010.00,'COD','2026-06-22 18:26:27.919331','PAID','MOCK_TXN_672B9BD6',1),(2,10016655.00,'COD','2026-06-25 13:29:47.429694','PAID','MOCK_TXN_48CEC84D',3),(3,6677770.00,'BANK_TRANSFER','2026-06-26 04:37:34.803337','PAID','MOCK_TXN_4369C55C',7),(4,750000.00,'BANK_TRANSFER','2026-07-04 08:22:02.607355','PAID','MOCK_TXN_24165C3B',9),(5,750000.00,'BANK_TRANSFER','2026-07-06 15:02:17.393746','PAID','MOCK_TXN_F87358FA',10),(6,1500000.00,'COD',NULL,'PENDING',NULL,19),(7,360000.00,'COD',NULL,'PENDING',NULL,20);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `is_primary` bit(1) NOT NULL,
  `sort_order` int NOT NULL,
  `url` varchar(200) NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqnq71xsohugpqwf3c9gxmsuy` (`product_id`),
  CONSTRAINT `FKqnq71xsohugpqwf3c9gxmsuy` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,_binary '',7,'bua.png',1),(2,_binary '',1,'bua1.png',1),(3,_binary '',5,'bua21.png',1),(4,_binary '',5,'bua221.png',1),(5,_binary '',5,'bcs.png',1),(6,_binary '',1,'https://res.cloudinary.com/dkw6t0xuc/image/upload/v1783092233/ecommerce/products/mtyki6hlraetbcrxvlpg.jpg',97),(7,_binary '\0',0,'https://res.cloudinary.com/dkw6t0xuc/image/upload/v1783127495/ecommerce/products/yya2aijngfzbkdcgwuwk.jpg',97),(8,_binary '',1,'https://res.cloudinary.com/dkw6t0xuc/image/upload/v1783310774/ecommerce/products/bdayqbu7pxcs1g5qgopt.jpg',97),(9,_binary '\0',2,'https://res.cloudinary.com/dkw6t0xuc/image/upload/v1783310799/ecommerce/products/wicwlrnyfzlrhb73dgxb.jpg',97),(10,_binary '\0',3,'https://res.cloudinary.com/dkw6t0xuc/image/upload/v1783310817/ecommerce/products/sxfga7vb4jpy3blychih.jpg',97),(11,_binary '\0',4,'https://res.cloudinary.com/dkw6t0xuc/image/upload/v1783312014/ecommerce/products/npp7wt0lmdneksovfpy4.png',97);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `description` text,
  `name` varchar(200) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `sold_count` int NOT NULL,
  `status` enum('ACTIVE','DELETED','INACTIVE') NOT NULL,
  `stock_quantity` int NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `category_id` bigint NOT NULL,
  `shop_id` bigint NOT NULL,
  `average_rating` double NOT NULL,
  `review_count` int NOT NULL,
  `version` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKog2rp4qthbtt2lfyhfo32lsw9` (`category_id`),
  KEY `FK7kp8sbhxboponhx3lxqtmkcoj` (`shop_id`),
  CONSTRAINT `FK7kp8sbhxboponhx3lxqtmkcoj` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`),
  CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (61,'2026-07-03 12:16:59.000000','Áo thun nam thấm hút mồ hôi tốt, phù hợp tập gym, chạy bộ.','Áo thun nam thể thao M1',150000.00,35,'ACTIVE',90,'2026-07-06 15:11:45.702727',8,3,3,2,0),(62,'2026-07-03 12:16:59.000000','Quần jean nam phong cách classic, dễ phối đồ.','Quần jean nam ống suông cổ điển',320000.00,10,'ACTIVE',50,'2026-07-03 12:16:59.000000',8,4,0,0,0),(63,'2026-07-03 12:16:59.000000','Ốp lưng tản nhiệt, chống va đập tiêu chuẩn quân đội.','Ốp lưng chống sốc iPhone 15',120000.00,155,'ACTIVE',2,'2026-07-03 12:16:59.000000',9,5,0,0,0),(64,'2026-07-03 12:16:59.000000','Sạc nhanh 20W, dung lượng chuẩn.','Sạc dự phòng 20000mAh',450000.00,42,'ACTIVE',80,'2026-07-03 12:16:59.000000',9,6,0,0,0),(65,'2026-07-03 12:16:59.000000','Tai nghe không dây pin 24h, âm thanh hi-res.','Tai nghe True Wireless E1',890000.00,18,'ACTIVE',40,'2026-07-03 12:16:59.000000',10,7,0,0,0),(66,'2026-07-03 12:16:59.000000','Loa công suất 10W, chuẩn kháng nước IPX7.','Loa Bluetooth mini chống nước',550000.00,30,'ACTIVE',60,'2026-07-03 12:16:59.000000',10,8,0,0,0),(67,'2026-07-03 12:16:59.000000','Bàn phím cơ Red switch gõ êm, kết nối bluetooth/2.4G.','Bàn phím cơ không dây',1150000.00,12,'ACTIVE',30,'2026-07-03 12:16:59.000000',11,9,0,0,0),(68,'2026-07-03 12:16:59.000000','Chuột chống mỏi tay cho dân văn phòng.','Chuột công thái học Ergonomic',650000.00,20,'ACTIVE',45,'2026-07-03 12:16:59.000000',11,10,0,0,0),(69,'2026-07-03 12:16:59.000000','Tripod nhôm siêu nhẹ cho điện thoại và máy ảnh.','Chân máy ảnh Tripod mini',250000.00,85,'ACTIVE',120,'2026-07-03 12:16:59.000000',12,11,0,0,0),(70,'2026-07-03 12:16:59.000000','Túi máy ảnh lót mút dày, vải dù cao cấp.','Túi đựng máy ảnh chống nước',480000.00,5,'ACTIVE',25,'2026-07-03 12:16:59.000000',12,12,0,0,0),(71,'2026-07-03 12:16:59.000000','Đồng hồ nam lộ máy, dây da bò thật.','Đồng hồ cơ nam Automatic',2500000.00,3,'ACTIVE',15,'2026-07-03 12:16:59.000000',13,3,0,0,0),(72,'2026-07-03 12:16:59.000000','Smartwatch đo nhịp tim, oxy máu, GPS.','Đồng hồ thông minh thể thao',1800000.00,14,'ACTIVE',35,'2026-07-03 12:16:59.000000',13,4,0,0,0),(73,'2026-07-03 12:16:59.000000','Giày thể thao êm ái, thích hợp đi làm đi chơi.','Giày sneaker nam cổ thấp',650000.00,28,'ACTIVE',70,'2026-07-03 12:16:59.000000',14,5,0,0,0),(74,'2026-07-03 12:16:59.000000','Giày lười êm chân, lịch sự.','Giày lười nam da lộn',850000.00,16,'ACTIVE',40,'2026-07-03 12:16:59.000000',14,6,0,0,0),(75,'2026-07-03 12:16:59.000000','Máy xay 500W, cối thủy tinh dễ vệ sinh.','Máy xay sinh tố đa năng',950000.00,10,'ACTIVE',25,'2026-07-03 12:16:59.000000',15,7,0,0,0),(76,'2026-07-03 12:16:59.000000','Ấm đun siêu tốc 1.8L tự ngắt an toàn.','Ấm siêu tốc inox 304',280000.00,75,'ACTIVE',150,'2026-07-03 12:16:59.000000',15,8,0,0,0),(77,'2026-07-03 12:16:59.000000','Balo leo núi chống nước, nhiều ngăn tiện lợi.','Balo dã ngoại 40L',750000.00,8,'ACTIVE',30,'2026-07-03 12:16:59.000000',16,9,0,0,0),(78,'2026-07-03 12:16:59.000000','Lều cắm trại nhanh chóng, chống tia UV.','Lều cắm trại tự bung 4 người',1250000.00,2,'ACTIVE',10,'2026-07-03 12:16:59.000000',16,10,0,0,0),(79,'2026-07-03 12:16:59.000000','Bơm điện tự ngắt, tích hợp đèn LED.','Bơm lốp ô tô mini',680000.00,15,'ACTIVE',50,'2026-07-03 12:16:59.000000',17,11,0,0,0),(80,'2026-07-03 12:16:59.000000','Camera ghi hình kép Full HD.','Camera hành trình trước sau',1500000.00,7,'ACTIVE',20,'2026-07-03 12:16:59.000000',17,12,0,0,0),(81,'2026-07-03 12:16:59.000000','Váy lụa mềm mại, phong cách vintage.','Váy hoa nhí dáng chữ A',350000.00,22,'ACTIVE',60,'2026-07-03 12:16:59.000000',18,3,0,0,0),(82,'2026-07-03 12:16:59.000000','Áo sơ mi nữ thanh lịch, chất lụa không nhăn.','Áo sơ mi lụa công sở',280000.00,45,'ACTIVE',80,'2026-07-03 12:16:59.000000',18,4,0,0,0),(83,'2026-07-03 12:16:59.000000','Xe đẩy siêu nhẹ, mang lên máy bay được.','Xe đẩy gấp gọn cho bé',1650000.00,6,'ACTIVE',15,'2026-07-03 12:16:59.000000',19,5,0,0,0),(84,'2026-07-03 12:16:59.000000','Địu cotton thoáng khí, an toàn cho cột sống bé.','Địu em bé 4 tư thế',450000.00,12,'ACTIVE',40,'2026-07-03 12:16:59.000000',19,6,0,0,0),(85,'2026-07-03 12:16:59.000000','Ga bọc nệm và 2 vỏ gối họa tiết kẻ.','Bộ ga gối cotton poly',350000.00,55,'ACTIVE',100,'2026-07-03 12:16:59.000000',20,7,0,0,0),(86,'2026-07-03 12:16:59.000000','Thảm lông chần mềm mại 1m6 x 2m.','Thảm trải sàn phòng khách',480000.00,10,'ACTIVE',30,'2026-07-03 12:16:59.000000',20,8,0,0,0),(87,'2026-07-03 12:16:59.000000','Serum mờ thâm, đều màu da dung tích 30ml.','Serum vitamin C sáng da',550000.00,25,'ACTIVE',50,'2026-07-03 12:16:59.000000',21,9,0,0,0),(88,'2026-07-03 12:16:59.000000','Son màu đỏ cam quyến rũ lâu trôi.','Son kem lì dưỡng ẩm',250000.00,68,'ACTIVE',120,'2026-07-03 12:16:59.000000',21,10,0,0,0),(89,'2026-07-03 12:16:59.000000','Đo nhiệt độ siêu tốc 1 giây.','Nhiệt kế hồng ngoại đo trán',450000.00,15,'ACTIVE',40,'2026-07-03 12:16:59.000000',22,11,0,0,0),(90,'2026-07-03 12:16:59.000000','Máy massage hồng ngoại giảm đau mỏi.','Máy massage cổ vai gáy',850000.00,8,'ACTIVE',25,'2026-07-03 12:16:59.000000',22,12,0,0,0),(91,'2026-07-03 12:16:59.000000','Giày êm chân, phù hợp đi làm, dự tiệc.','Giày cao gót mũi nhọn 5cm',450000.00,30,'ACTIVE',60,'2026-07-03 12:16:59.000000',23,3,0,0,0),(92,'2026-07-03 12:16:59.000000','Giày đế bệt dạo phố.','Giày búp bê đính nơ',320000.00,12,'ACTIVE',40,'2026-07-03 12:16:59.000000',23,4,0,0,0),(93,'2026-07-03 12:16:59.000000','Túi xách nữ form vuông cá tính.','Túi xách đeo chéo dây xích',580000.00,18,'ACTIVE',35,'2026-07-03 12:16:59.000000',24,5,0,0,0),(94,'2026-07-03 12:16:59.000000','Balo da pu mềm mịn thời trang.','Balo da mini nữ',420000.00,20,'ACTIVE',50,'2026-07-03 12:16:59.000000',24,6,0,0,0),(95,'2026-07-03 12:16:59.000000','Kính râm gọng vuông unisex.','Kính mát chống tia UV',250000.00,86,'ACTIVE',144,'2026-07-03 12:16:59.000000',25,7,0,0,0),(96,'2026-07-03 12:16:59.000000','Dây chuyền nữ mặt hoa đính đá.','Dây chuyền titan không gỉ',180000.00,42,'ACTIVE',80,'2026-07-03 12:16:59.000000',25,8,0,0,0),(97,'2026-07-03 12:16:59.000000','Hạt macca Úc size lớn hộp 500g.','Hạt mắc ca sấy nứt vỏ',180000.00,154,'ACTIVE',196,'2026-07-03 12:16:59.000000',26,9,0,0,0),(98,'2026-07-03 12:16:59.000000','Cà phê Robusta Moka blend gói 500g.','Cà phê rang xay nguyên chất',150000.00,46,'ACTIVE',99,'2026-07-03 12:16:59.000000',26,10,0,0,0),(99,'2026-07-03 12:16:59.000000','Sổ tay 200 trang giấy dày chống lóa.','Sổ tay bìa da A5 cao cấp',120000.00,60,'ACTIVE',120,'2026-07-03 12:16:59.000000',27,11,0,0,0),(100,'2026-07-03 12:16:59.000000','Bút màu marker cho bé thỏa sức sáng tạo.','Hộp bút màu dạ 48 chi tiết',220000.00,15,'ACTIVE',40,'2026-07-03 12:16:59.000000',27,12,0,0,0),(101,'2026-07-03 12:16:59.000000','Túi vải oxford bền bỉ phong cách đường phố.','Túi đeo chéo nam chống nước',350000.00,28,'ACTIVE',60,'2026-07-03 12:16:59.000000',28,3,0,0,0),(102,'2026-07-03 12:16:59.000000','Cặp da bò thật vừa laptop 14 inch.','Cặp da công sở đựng laptop',1250000.00,5,'ACTIVE',20,'2026-07-03 12:16:59.000000',28,4,0,0,0),(103,'2026-07-03 12:16:59.000000','Đồ chơi phát triển trí tuệ cho bé.','Bộ xếp hình lego 1000 chi tiết',450000.00,20,'ACTIVE',50,'2026-07-03 12:16:59.000000',29,5,0,0,0),(104,'2026-07-03 12:16:59.000000','Xe địa hình pin sạc siêu khỏe.','Xe ô tô điều khiển từ xa',380000.00,25,'ACTIVE',45,'2026-07-03 12:16:59.000000',29,6,0,0,0),(105,'2026-07-03 12:16:59.000000','Bao 1.5kg hạt hỗn hợp cá và gà.','Thức ăn hạt cho mèo trưởng thành',180000.00,90,'ACTIVE',150,'2026-07-03 12:16:59.000000',30,7,0,0,0),(106,'2026-07-03 12:16:59.000000','Vòng cổ điều chỉnh size cho chó mèo nhỏ.','Vòng cổ thú cưng có chuông',450000.00,35,'ACTIVE',80,'2026-07-03 12:16:59.000000',30,8,0,0,0),(107,'2026-07-03 12:16:59.000000','Bộ đồ nghề sửa chữa linh kiện điện tử.','Bộ tua vít đa năng 45 in 1',150000.00,45,'ACTIVE',100,'2026-07-03 12:16:59.000000',31,9,0,0,0),(108,'2026-07-03 12:16:59.000000','Máy khoan pin 12V kèm bộ mũi khoan.','Máy khoan cầm tay gia đình',650000.00,12,'ACTIVE',30,'2026-07-03 12:16:59.000000',31,10,0,0,0),(109,'2026-07-03 12:16:59.000000','Set cotton thấm mồ hôi in hình siêu nhân.','Bộ quần áo thun cho bé trai',180000.00,40,'ACTIVE',80,'2026-07-03 12:16:59.000000',32,11,0,0,0),(110,'2026-07-03 12:16:59.000000','Váy voan lộng lẫy size từ 3-8 tuổi.','Váy công chúa dự tiệc bé gái',350000.00,15,'ACTIVE',40,'2026-07-03 12:16:59.000000',32,12,0,0,0),(111,'2026-07-03 12:16:59.000000','Can nước giặt 3.8L hương hoa mộc lan.','Nước giặt xả 2 trong 1',180000.00,120,'ACTIVE',200,'2026-07-03 12:16:59.000000',33,3,0,0,0),(112,'2026-07-03 12:16:59.000000','Bộ lau nhà kèm thùng vắt 2 ngăn.','Cây lau nhà tự vắt thông minh',280000.00,28,'ACTIVE',60,'2026-07-03 12:16:59.000000',33,4,0,0,0),(113,'2026-07-03 12:16:59.000000','Thẻ cào điện thoại mệnh giá 100k.','Voucher nạp tiền điện thoại',95000.00,350,'ACTIVE',500,'2026-07-03 12:16:59.000000',34,5,0,0,0),(114,'2026-07-03 12:16:59.000000','Gói dọn dẹp nhà cửa 2 giờ.','Mã giảm giá dịch vụ vệ sinh',150000.00,45,'ACTIVE',100,'2026-07-03 12:16:59.000000',34,6,0,0,0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` text,
  `created_at` datetime(6) NOT NULL,
  `rating` int NOT NULL,
  `buyer_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_review` (`buyer_id`,`order_id`,`product_id`),
  KEY `FKqwgq1lxgahsxdspnwqfac6sv6` (`order_id`),
  KEY `FKpl51cejpw4gy5swfar8br9ngi` (`product_id`),
  CONSTRAINT `FK2noibxu5e960l1c3wk929342s` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKpl51cejpw4gy5swfar8br9ngi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKqwgq1lxgahsxdspnwqfac6sv6` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,'nhu cai con cac','2026-06-25 15:44:41.519928',5,4,2,4),(2,'đớp bố m đi','2026-07-04 08:43:54.904956',5,3,9,61),(3,'áo như lồn','2026-07-06 15:11:45.681727',1,4,10,61);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shops`
--

DROP TABLE IF EXISTS `shops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shops` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(50) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` text,
  `is_active` bit(1) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `seller_id` bigint NOT NULL,
  `rating` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK9v5nt3qwk4ipqd7ft2so9jxn8` (`seller_id`),
  CONSTRAINT `FKqu7p50yuiaukogi05ibair0ru` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shops`
--

LOCK TABLES `shops` WRITE;
/*!40000 ALTER TABLE `shops` DISABLE KEYS */;
INSERT INTO `shops` VALUES (1,'Bac Ninh','2026-06-13 09:00:21.536803','chuyen the thao',_binary '','image.png','PHD vlog',2,0),(2,'Bac Ninh','2026-06-13 12:17:05.578626','chuyen xe',_binary '','image.png','BOard',1,0),(3,'12 Nguyễn Trãi, Q.1, TP.HCM','2026-07-04 10:55:21.000000','Chuyên đồ nam chất lượng',_binary '','shop1-logo.png','An Store',26,0.5),(4,'45 Lê Lợi, Q.1, TP.HCM','2026-07-04 10:55:21.000000','Thời trang nữ cao cấp',_binary '','shop2-logo.png','Bình Fashion',27,0),(5,'78 Trần Hưng Đạo, Q.5, TP.HCM','2026-07-04 10:55:21.000000','Điện tử - phụ kiện công nghệ',_binary '','shop3-logo.png','Cường Tech',28,0),(6,'23 CMT8, Q.3, TP.HCM','2026-07-04 10:55:21.000000','Mỹ phẩm - làm đẹp chính hãng',_binary '','shop4-logo.png','Dung Beauty',29,0),(7,'56 Nguyễn Văn Cừ, Q.5, TP.HCM','2026-07-04 10:55:21.000000','Đồ gia dụng - nội thất',_binary '','shop5-logo.png','Em Home',30,0),(8,'89 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM','2026-07-04 10:55:21.000000','Đồ trẻ em - mẹ và bé',_binary '','shop6-logo.png','Phương Kids',31,0),(9,'34 Phan Xích Long, Q.Phú Nhuận, TP.HCM','2026-07-04 10:55:21.000000','Thể thao - dã ngoại',_binary '','shop7-logo.png','Giang Sport',32,0),(10,'67 Lý Thường Kiệt, Q.10, TP.HCM','2026-07-04 10:55:21.000000','Thức ăn - phụ kiện thú cưng',_binary '','shop8-logo.png','Hoa Pet Shop',33,0),(11,'90 Quang Trung, Q.Gò Vấp, TP.HCM','2026-07-04 10:55:21.000000','Phụ kiện ô tô - xe máy',_binary '','shop9-logo.png','Inh Auto',34,0),(12,'15 Hoàng Văn Thụ, Q.Tân Bình, TP.HCM','2026-07-04 10:55:21.000000','Bách hóa - tạp hóa online',_binary '','shop10-logo.png','Kim Mart',35,0);
/*!40000 ALTER TABLE `shops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK8klxsgb8dcjjklmqebqp1twd5` (`user_id`),
  CONSTRAINT `FK8klxsgb8dcjjklmqebqp1twd5` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
INSERT INTO `user_sessions` VALUES ('0b988f5e-a309-47c8-aeb6-e9c6f8cca690','2026-07-10 21:15:37.328299','Postman (API Client)','2026-07-11 21:15:37.321291',4),('2a77b33a-8ff6-420a-ad7a-7639da33339b','2026-07-10 20:32:35.048538','Postman (API Client)','2026-07-11 20:32:35.030810',4),('33e90071-e1eb-497e-a042-6e94b2df31e9','2026-07-10 21:13:25.321685','Postman (API Client)','2026-07-11 21:13:25.250799',4),('7b766cc0-c117-46b4-8581-31c587967c55','2026-07-10 21:01:46.871060','Postman (API Client)','2026-07-11 21:01:46.862852',4),('8ef3193e-7090-4ceb-a6ae-871acdecb7c2','2026-07-11 17:58:48.131891','Chrome-Windows','2026-07-12 17:58:48.106341',4),('9bd1fdb9-a4f1-48e2-9b75-980389e741f0','2026-07-10 20:52:07.657942','Postman (API Client)','2026-07-11 20:52:07.594888',4),('a0a92c04-aae0-4031-bedd-225c77768e71','2026-07-11 16:33:39.719114','Postman (API Client)','2026-07-12 16:33:39.659368',4),('b4325e75-5d33-47f4-838c-a96e03b4966a','2026-07-10 22:26:45.312713','Postman (API Client)','2026-07-11 22:26:45.191190',4),('f1658eda-8028-48e0-94a5-c393b78a7a98','2026-07-10 17:29:57.832151','Postman (API Client)','2026-07-11 17:29:57.764598',4);
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `avatar_url` varchar(500) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(30) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('ADMIN','BUYER','SELLER','SUPPORT') NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKr53o2ojjw4fikudfnsuuga336` (`password`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'2026-06-12 16:52:04.879276','vylote1@gmail.com','Le Thanh Vy',_binary '','$2a$10$8kBq/wj1EB6sW4s0tiKnvOJmPvgJBJblms/0MD0rIIGx5ywrZDpx.','0343238074','SELLER','2026-06-12 16:52:04.879276'),(2,NULL,'2026-06-13 08:59:57.767062','vylote@gmail.com','Le Thanh Vy',_binary '','$2a$10$Qe5p.ZpG9jUgk.AENS1xpOHhXg6sx9cSPNWryuM4UzwyfIUF7yWEe','0343238074','SELLER','2026-06-13 08:59:57.768060'),(3,NULL,'2026-06-15 15:52:15.982678','buyer1@gmail.com','Le Thanh Vy',_binary '','$2a$10$cTwYYYIhPSOi1ZrygzMwTer1uY2y5nRpttu9q.uKf6RXRxFjaXM.y','0343238074','BUYER','2026-06-15 15:52:15.982678'),(4,NULL,'2026-06-15 23:21:38.520925','buyer2@gmail.com','Le Thanh Vy',_binary '','$2a$10$b9Ko1QE/uiIB0vMmddm4s.6K1BDT4aPg677WSodFrgkoDW4XQE/mW','0343238074','BUYER','2026-06-15 23:21:38.520925'),(5,NULL,'2026-06-21 23:24:59.912795','admin@gmail.com','super administrator',_binary '','$2a$10$3st8wmNGFdm9JBXFJnOkc.gPjet4qQwALDzSN6nO98vzINBrb2o2S',NULL,'ADMIN','2026-06-21 23:24:59.912795'),(26,NULL,'2026-07-04 10:54:24.000000','seller1@shop.vn','Nguyễn Văn An',_binary '','$2b$10$pj9/xtRIBdAOYxCrchfXiOMx8.Rm44v5DLP5sE1S19kKoJhMfS3IC','0901111111','SELLER','2026-07-04 10:54:24.000000'),(27,NULL,'2026-07-04 10:54:24.000000','seller2@shop.vn','Trần Thị Bình',_binary '','$2b$10$bu9g5LJ.2MbeVO.r3M8KM.oXgNTSoxKCa.IEI3huXBL.wa.lhakNG','0901111112','SELLER','2026-07-04 10:54:24.000000'),(28,NULL,'2026-07-04 10:54:24.000000','seller3@shop.vn','Lê Văn Cường',_binary '','$2b$10$/ivoed9nNP.BUGXUIlNu1.jG/sZ4mNdj1ecOAkttiIkUyp2oDVqMy','0901111113','SELLER','2026-07-04 10:54:24.000000'),(29,NULL,'2026-07-04 10:54:24.000000','seller4@shop.vn','Phạm Thị Dung',_binary '','$2b$10$uKKvmguqy.K3WUaV9DSHM.xYZjgFYdXhPQy0B/2F0Jd7tXZMOuCdy','0901111114','SELLER','2026-07-04 10:54:24.000000'),(30,NULL,'2026-07-04 10:54:24.000000','seller5@shop.vn','Hoàng Văn Em',_binary '','$2b$10$oZti72.9FxM7KwFPqyptb.awh89V7tt/EaOnS4IKh4Z65or.YI1U2','0901111115','SELLER','2026-07-04 10:54:24.000000'),(31,NULL,'2026-07-04 10:54:24.000000','seller6@shop.vn','Đỗ Thị Phương',_binary '','$2b$10$pQaMZu.NLFx.E9CrBv278OlHeIGSGa47yoOTc42h31EDNgyBbT44q','0901111116','SELLER','2026-07-04 10:54:24.000000'),(32,NULL,'2026-07-04 10:54:24.000000','seller7@shop.vn','Vũ Văn Giang',_binary '','$2b$10$wVmIhOg.ifgdP1VruksoqeAcs7Phc5Jia/LPmvdbvLzfTZ3xCk24K','0901111117','SELLER','2026-07-04 10:54:24.000000'),(33,NULL,'2026-07-04 10:54:24.000000','seller8@shop.vn','Bùi Thị Hoa',_binary '','$2b$10$KC3i1F5g7PKvQNqXkuiGg.qtj.e2AgPTJPF9.vW2cWcWugGlU7OBq','0901111118','SELLER','2026-07-04 10:54:24.000000'),(34,NULL,'2026-07-04 10:54:24.000000','seller9@shop.vn','Đặng Văn Inh',_binary '','$2b$10$0FDhLwFtvvrJkz8I2aUKhuWtrLCIgTsixgugASoXtRM8VI0BlXKE6','0901111119','SELLER','2026-07-04 10:54:24.000000'),(35,NULL,'2026-07-04 10:54:24.000000','seller10@shop.vn','Ngô Thị Kim',_binary '','$2b$10$DL/8KDM6rTdWE.cw6241auXZiy9mQH8fb4LGfecy/dsdlFiCjVCZ6','0901111120','SELLER','2026-07-04 10:54:24.000000');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-12  6:11:29
