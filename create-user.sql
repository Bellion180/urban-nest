-- Crear usuario admin@urbannest.com directamente en SQL
-- Ejecutar este comando en tu base de datos MySQL

INSERT INTO `User` (id, name, email, password, role, createdAt, updatedAt) 
VALUES (
  CONCAT('cmfd', LOWER(CONV(FLOOR(RAND() * 99999), 10, 36)), LOWER(CONV(FLOOR(RAND() * 99999), 10, 36))),
  'Admin UrbanNest',
  'admin@urbannest.com',
  '$2a$10$8K1p5UdTyemQgqfxzTZETO.nOxeDsx4ExkYDbgqUZoHIHKx0o9Caa', -- Este es 'admin123' hasheado con bcrypt
  'ADMIN',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  password = '$2a$10$8K1p5UdTyemQgqfxzTZETO.nOxeDsx4ExkYDbgqUZoHIHKx0o9Caa';
