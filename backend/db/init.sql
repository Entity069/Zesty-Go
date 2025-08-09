CREATE DATABASE IF NOT EXISTS zestydb;
USE zestydb;

CREATE TABLE `users` (
  `id` INT  AUTO_INCREMENT PRIMARY KEY,
  `profile_pic` VARCHAR(255),
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `user_type` ENUM('user', 'seller', 'admin') NOT NULL DEFAULT 'user',
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `address` VARCHAR(255) NOT NULL,
  `balance` DECIMAL(10,2) NOT NULL DEFAULT 200.00 CHECK (`balance` >= 0),
  `is_verified` BOOL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `orders` (
  `id` INT  AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT  NOT NULL,
  `status` ENUM('cart', 'ordered', 'preparing', 'prepared', 'cancelled', 'delivered') NOT NULL DEFAULT 'cart',
  `message` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `payments` (
  `id` INT  AUTO_INCREMENT PRIMARY KEY,
  `payee_id` INT  NOT NULL,
  `order_id` INT  NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL CHECK (`amount` >= 0),
  `discount` DECIMAL(10,2),
  `is_paid` BOOL DEFAULT 0,
  FOREIGN KEY (`payee_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
);

CREATE TABLE `categories` (
  `id` INT  AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE DEFAULT 'Zesty Special',
  `description` VARCHAR(255)
);

CREATE TABLE `items` (
  `id` INT  AUTO_INCREMENT PRIMARY KEY,
  `seller_id` INT  NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `image` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255),
  `price` DECIMAL(10,2) NOT NULL CHECK (`price` >= 0),
  `category_id` INT  NOT NULL,
  `status` ENUM('available', 'unavailable', 'discontinued') NOT NULL DEFAULT 'available',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `order_items` (
  `id` INT  AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT  NOT NULL,
  `item_id` INT  NOT NULL,
  `quantity` INT  NOT NULL CHECK (`quantity` >= 0),
  `status` ENUM('ordered', 'preparing', 'prepared', 'cancelled', 'delivered') NOT NULL DEFAULT 'ordered',
  `unit_price` DECIMAL(10,2) NOT NULL CHECK (`unit_price` >= 0),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE
);

CREATE TABLE `reviews` (
  `id` INT  AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT  NOT NULL,
  `item_id` INT  NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE
);
