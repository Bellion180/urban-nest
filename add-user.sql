-- SQL Script to add a special USER account directly
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `createdAt`, `updatedAt`) 
VALUES 
('usr123456', 'usuario@urbannest.com', '$2a$10$4JXEMiUoPDw9ZTBjBK4rEehQJq3NpnXouEJwQF.QTF61TCKzGPE8y', 'Usuario Especial', 'USER', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  `name` = 'Usuario Especial', 
  `role` = 'USER',
  `updatedAt` = NOW();
