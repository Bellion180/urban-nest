
      INSERT INTO users (id, email, password, name, role, createdAt, updatedAt) 
      VALUES (
        'usr_special', 
        'usuario@urbannest.com', 
        '$2b$10$R./umE32Yf44z0xoO1AgseoMfnWHyn.Wt/pTdCNxdk1KUlttyY/F.', 
        'Usuario Especial', 
        'USER',
        NOW(), 
        NOW()
      )
      ON DUPLICATE KEY UPDATE 
        password = '$2b$10$R./umE32Yf44z0xoO1AgseoMfnWHyn.Wt/pTdCNxdk1KUlttyY/F.',
        name = 'Usuario Especial',
        updatedAt = NOW();
    