USE `zestydb`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
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
