USE `zestydb`;

CREATE TABLE `items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `seller_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `image` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255),
  `price` DECIMAL(10,2) NOT NULL CHECK (`price` >= 0),
  `category_id` INT NOT NULL,
  `status` ENUM('available', 'unavailable', 'discontinued') NOT NULL DEFAULT 'available',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
