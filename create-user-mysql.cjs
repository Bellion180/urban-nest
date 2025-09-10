const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'urban_nest_db'
  });

  try {
    console.log('👤 Creando usuario admin@urbannest.com...');
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insertar usuario
    const [result] = await connection.execute(
      `INSERT IGNORE INTO User (id, name, email, password, role, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        `cmfd${Math.random().toString(36).substr(2, 9)}`,
        'Admin UrbanNest',
        'admin@urbannest.com',
        hashedPassword,
        'ADMIN'
      ]
    );

    if (result.affectedRows > 0) {
      console.log('✅ Usuario creado exitosamente');
    } else {
      console.log('ℹ️ Usuario ya existe, actualizando contraseña...');
      await connection.execute(
        'UPDATE User SET password = ? WHERE email = ?',
        [hashedPassword, 'admin@urbannest.com']
      );
      console.log('✅ Contraseña actualizada');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createUser();
