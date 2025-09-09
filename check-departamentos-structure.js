import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkDepartamentosTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'c',
    database: 'urban_nest_db'
  });

  try {
    console.log('🔍 Verificando estructura real de la tabla departamentos...\n');

    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' 
        AND TABLE_NAME = 'departamentos'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📋 Columnas en la tabla departamentos:');
    columns.forEach(col => {
      const key = col.COLUMN_KEY ? ` [${col.COLUMN_KEY}]` : '';
      const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultValue = col.COLUMN_DEFAULT ? ` DEFAULT ${col.COLUMN_DEFAULT}` : '';
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${nullable}${defaultValue}${key}`);
    });

    console.log('\n🔍 Datos de muestra en departamentos:');
    const [rows] = await connection.execute('SELECT * FROM departamentos LIMIT 3');
    console.log('Filas encontradas:', rows.length);
    rows.forEach((row, index) => {
      console.log(`Fila ${index + 1}:`, row);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkDepartamentosTable();
