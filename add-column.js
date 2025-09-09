import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addImageColumn() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'c',
    database: 'urban_nest_db'
  });

  try {
    console.log('🔍 Verificando si la columna imagen ya existe...');
    
    // Verificar si la columna existe
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' 
        AND TABLE_NAME = 'torres' 
        AND COLUMN_NAME = 'imagen'
    `);

    if (columns.length > 0) {
      console.log('✅ La columna imagen ya existe en la tabla torres');
    } else {
      console.log('🔧 Agregando columna imagen a la tabla torres...');
      await connection.execute(`
        ALTER TABLE torres ADD COLUMN imagen VARCHAR(500) NULL
      `);
      console.log('✅ Columna imagen agregada exitosamente');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addImageColumn();
