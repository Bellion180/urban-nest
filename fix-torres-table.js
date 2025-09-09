import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addMissingColumns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'c',
    database: 'urban_nest_db'
  });

  try {
    console.log('🔍 Verificando estructura de la tabla torres...');
    
    // Verificar columnas existentes en la tabla torres
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' 
        AND TABLE_NAME = 'torres'
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('📋 Columnas existentes:', existingColumns);

    // Columnas que deberían existir según el schema
    const requiredColumns = [
      { name: 'descripcion', type: 'VARCHAR(500) NULL' },
      { name: 'imagen', type: 'VARCHAR(500) NULL' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];

    // Agregar columnas faltantes
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`🔧 Agregando columna faltante: ${column.name}`);
        await connection.execute(`
          ALTER TABLE torres ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`✅ Columna ${column.name} agregada exitosamente`);
      } else {
        console.log(`✅ Columna ${column.name} ya existe`);
      }
    }

    // Verificar estructura final
    console.log('\n🔍 Verificando estructura final...');
    const [finalColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' 
        AND TABLE_NAME = 'torres'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📋 Estructura final de la tabla torres:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n✅ ¡Tabla torres actualizada correctamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addMissingColumns();
