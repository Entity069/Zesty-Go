-- MySQL dump 10.13  Distrib 8.4.5, for Linux (x86_64)
--
-- Host: localhost    Database: zestydb
-- ------------------------------------------------------
-- Server version	8.4.5

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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL UNIQUE DEFAULT 'Zesty Special',
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Zesty Special','A special set of cuisine curated by Zesty!'),(2,'Epstein Island Special','A collection of tender meat procured from the children (of a sheep)!'),(3,'जीवन','जीवन का स्वाद\n'),(11,'Pasta','Pasta perfection: fresh strands, house‑made sauces & unexpected twists.'),(12,'Seafood','Ocean delights: grilled fish, shellfish platters & citrusy ceviches.'),(13,'Healthy & Vegan','Plant‑powered plates: vibrant bowls, superfood smoothies & guilt‑free treats. (not really tho)'),(14,'Juice','A place where all the troublemakers are found!'),(15,'Italian','Classic Italian comfort: al dente pasta, wood‑fired pizzas & rich, creamy risottos.'),(16,'Thai','Aromatic Thai flavors: lemongrass, chili, coconut milk & fresh herbs in every bite.'),(17,'Sushi','Artisanal sushi & sashimi: precision‑cut fish, seasoned rice & wasabi heat.'),(18,'Burgers','Juicy gourmet burgers: grass‑fed patties, artisan buns & creative toppings.');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` int NOT NULL,
  `status` enum('available','unavailable','discontinued') NOT NULL DEFAULT 'available',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `seller_id` (`seller_id`),
  CONSTRAINT `items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `items_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `items_chk_1` CHECK ((`price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,22,'Pure Retardium','/uploads/item-images/item-image-1751660387147.jpg','Finally, pure Retardium.',69420.00,2,'available','2025-07-05 01:49:47'),(2,22,'Pure Retardium (extra retardness)','/uploads/item-images/item-image-1751660425184.jpg','Pure Retardium but with extra retardness.',694200.00,2,'available','2025-07-05 01:50:25'),(3,21,'अनंत पीड़ा','/uploads/item-images/item-image-1751660755801.jpg','दुःख | दर्द | अफ़सोस | वेदना | व्यथा | शोक | संताप | मातम | पीड़ा | विपदा | खेद | तकलीफ़ | कसक | अवसाद | आफ़त | कुढ़न | खिन्नता | गम | ग्लानि | ज़हमत | टीस | ताप | त्रास | कष्ट | दरद | दुखड़ा | बला | बियाधि | मलाल | मुसीबत | यंत्रणा | यातना | रंज',0.00,3,'available','2025-07-05 01:55:55'),(4,21,'मौत का नंगा नाच ','/uploads/item-images/item-image-1751660794991.jpg','मौत का नंगा नाच ',69.00,1,'available','2025-07-05 01:56:34'),(5,16,'Biryani','/uploads/item-images/item-image-1751661031512.jpg','Fragrant layers of spiced rice, tender meat or veggies, toasted nuts & caramelized onions in every aromatic bite.',120.00,13,'available','2025-07-05 02:00:31'),(6,17,'Dosa','/uploads/item-images/item-image-1751661137658.jpg','Crispy rice‑and‑lentil crepes served hot with tangy sambar & an array of flavorful chutneys.',140.00,13,'available','2025-07-05 02:02:17'),(7,17,'no shit fr','/uploads/item-images/item-image-1751661252885.jpg','no shit sherlock',6969.00,1,'available','2025-07-05 02:04:12'),(8,19,'Mom\'s Spaghetti','/uploads/item-images/item-image-1751661628981.jpg','There\'s vomit on his sweater already, mom\'s spaghetti\r\nHe\'s nervous, but on the surface, he looks calm and ready\r\nTo drop bombs.',548.00,11,'available','2025-07-05 02:10:28'),(9,22,'Cat','/uploads/item-images/item-image-1751661724226.jpg','Just a good ol\' cat',69.00,13,'available','2025-07-05 02:12:04'),(10,13,'Potato Curry','/uploads/item-images/item-image-1751664019727.jpg','Hearty potato curry simmered in a fragrant blend of spices, tomato & coconut milk for cozy, comforting vibes.',80.00,16,'available','2025-07-05 02:50:19'),(11,18,'magdonal','/uploads/item-images/item-image-1751664788499.jpg','Iconic fast‑food chain serving flame‑grilled burgers, crispy golden fries & classic shakes around the globe.',550.04,18,'available','2025-07-05 03:03:08'),(12,18,'Tourist\'s Delight','/uploads/item-images/item-image-1751665145416.jpg','A can of military rations taken from an army depot raided by stalkers, one wonders if it already gone past its expiration date. It is capable of satisfying hunger and partially restoring some of the player\'s health.',65.00,15,'available','2025-07-05 03:09:05');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL,
  `status` enum('ordered','preparing','prepared','cancelled','delivered') NOT NULL DEFAULT 'ordered',
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_chk_1` CHECK ((`quantity` >= 0)),
  CONSTRAINT `order_items_chk_2` CHECK ((`unit_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `status` enum('cart','ordered','preparing','prepared','cancelled','delivered') NOT NULL DEFAULT 'cart',
  `message` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payee_id` int NOT NULL,
  `order_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT NULL,
  `is_paid` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `payee_id` (`payee_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`payee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_chk_1` CHECK ((`amount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `rating` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profile_pic` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `user_type` enum('user','seller','admin') NOT NULL DEFAULT 'user',
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `balance` decimal(10,2) NOT NULL DEFAULT '200.00',
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `users_chk_1` CHECK ((`balance` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'https://s3.tebi.io/zesty-test/80216737.jpeg','Zesty','Admin','admin','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','admin@zes.ty','1467 Cedar Court, Dallas, NY 49522',200.00,1,'2025-07-04 21:59:49','2025-07-05 03:15:12'),(2,'https://s3.tebi.io/zesty-test/80216737.jpeg','John','Doe','user','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','john.doe@user.com','123 Elm St, Springfield',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(3,'https://s3.tebi.io/zesty-test/80216737.jpeg','Jane','Smith','user','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','jane.smith@user.com','456 Oak Ave, Metropolis',200.00,0,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(4,'https://s3.tebi.io/zesty-test/80216737.jpeg','Emily','Davis','user','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','emily.davis@user.com','789 Maple Rd, Gotham',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(5,'https://s3.tebi.io/zesty-test/80216737.jpeg','Michael','Johnson','user','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','michael.johnson@user.com','321 Pine St, Smallville',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(6,'https://s3.tebi.io/zesty-test/80216737.jpeg','Sarah','Wilson','user','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','sarah.wilson@user.com','654 Cedar Blvd, Atlantis',200.00,0,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(7,'https://s3.tebi.io/zesty-test/80216737.jpeg','David','Brown','user','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','david.brown@user.com','987 Birch Ln, Emerald City',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(8,'https://s3.tebi.io/zesty-test/80216737.jpeg','Laura','Taylor','user','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','laura.taylor@user.com','159 Fir Dr, Arkham',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(9,'https://s3.tebi.io/zesty-test/80216737.jpeg','Robert','Anderson','user','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','robert.anderson@user.com','753 Redwood Way, Raccoon City',200.00,0,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(10,'https://s3.tebi.io/zesty-test/80216737.jpeg','Linda','Thompson','user','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','linda.thompson@user.com','951 Spruce Ct, Zootopia',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(11,'https://s3.tebi.io/zesty-test/80216737.jpeg','James','Garcia','user','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','james.garcia@user.com','246 Aspen Pl, Hill Valley',200.00,0,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(12,'https://s3.tebi.io/zesty-test/80216737.jpeg','The Italian','Kitchen','seller','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','theitalian.kitchen@seller.com','100 Pasta Blvd, Little Italy',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(13,'https://s3.tebi.io/zesty-test/80216737.jpeg','Spicy Thai','Kitchen','seller','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','spicythai.kitchen@seller.com','200 Curry Rd, Chinatown',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(14,'https://s3.tebi.io/zesty-test/80216737.jpeg','Sushi','House','seller','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','sushi.house@seller.com','300 Ocean Ave, Seaside',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(15,'https://s3.tebi.io/zesty-test/80216737.jpeg','Burger','Barn','seller','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','burger.barn@seller.com','400 Grill St, Burger Town',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(16,'https://s3.tebi.io/zesty-test/80216737.jpeg','BBQ','Pit','seller','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','bbq.pit@seller.com','500 Smoke Ln, Rib City',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(17,'https://s3.tebi.io/zesty-test/80216737.jpeg','Curry','Palace','seller','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','curry.palace@seller.com','600 Spice Rd, Flavor Town',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(18,'https://s3.tebi.io/zesty-test/80216737.jpeg','Taco','Loco','seller','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','taco.loco@seller.com','700 Fiesta Ave, Taco City',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(19,'https://s3.tebi.io/zesty-test/80216737.jpeg','Pasta','Paradise','seller','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','pasta.paradise@seller.com','800 Noodle Blvd, Carb City',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(20,'https://s3.tebi.io/zesty-test/80216737.jpeg','Seafood','Shack','seller','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','seafood.shack@seller.com','900 Harbor St, Bay Area',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(21,'https://s3.tebi.io/zesty-test/80216737.jpeg','Healthy','Bite','seller','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','healthy.bite@seller.com','1000 Greenway Rd, Wellness City',200.00,1,'2025-07-05 01:33:08','2025-07-05 01:33:08'),(22,'https://s3.tebi.io/zesty-test/diddy-arrested.jpg','Diddy','Diners','seller','$2b$10$ptpMXwy3WLCrs1zY5w4HA.J2q33SmCUQKtOrlOvPpj6qVZ1NDdxSK','diddy.diners@pdf.file','100 Ped Oblivion, Little Italy',6942000.00,1,'2025-07-05 01:43:11','2025-07-05 01:43:11');
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

-- Dump completed on 2025-07-05  3:16:57
