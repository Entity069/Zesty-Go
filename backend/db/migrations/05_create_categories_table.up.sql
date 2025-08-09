USE `zestydb`;

CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE DEFAULT 'Zesty Special',
  `description` VARCHAR(255)
);
