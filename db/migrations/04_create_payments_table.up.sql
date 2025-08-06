USE `zestydb`;

CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payee_id` INT NOT NULL,
  `order_id` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL CHECK (`amount` >= 0),
  `discount` DECIMAL(10,2),
  `is_paid` BOOL DEFAULT 0,
  FOREIGN KEY (`payee_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
);
