-- SQL script to add special user

-- First check if USER is a valid enum value
SELECT column_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'role'
AND table_schema = 'urban_nest_db';

-- Add USER to enum if not present (this might fail if enum already includes USER)
-- ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'RESIDENT', 'USER') NOT NULL DEFAULT 'RESIDENT';

-- Insert special user if not exists
INSERT INTO users (id, email, password, name, role, createdAt, updatedAt) 
VALUES (
  'usr_special', 
  'usuario@urbannest.com', 
  '$2a$10$WpXy5Hh36vQKfvVw6Amu.OQniHgnNuwGrO2S.kwQhSPPRzO3H5VRa', -- bcrypt hash of "usuario123"
  'Usuario Especial', 
  'USER',
  NOW(), 
  NOW()
)
ON DUPLICATE KEY UPDATE 
  password = '$2a$10$WpXy5Hh36vQKfvVw6Amu.OQniHgnNuwGrO2S.kwQhSPPRzO3H5VRa',
  role = 'USER',
  updatedAt = NOW();
