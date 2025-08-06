USE `zestydb`;

CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `quantity` INT NOT NULL CHECK (`quantity` >= 0),
  `status` ENUM('ordered', 'preparing', 'prepared', 'cancelled', 'delivered') NOT NULL DEFAULT 'ordered',
  `unit_price` DECIMAL(10,2) NOT NULL CHECK (`unit_price` >= 0),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE
);
