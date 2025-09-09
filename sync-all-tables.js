import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function syncAllTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'c',
    database: 'urban_nest_db'
  });

  try {
    console.log('🔍 Sincronizando todas las tablas con el schema de Prisma...\n');

    // ========== TABLA TORRES ==========
    console.log('🏢 Verificando tabla torres...');
    const [torresColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' AND TABLE_NAME = 'torres'
    `);
    
    const torresExisting = torresColumns.map(col => col.COLUMN_NAME);
    console.log('📋 Columnas existentes en torres:', torresExisting);

    // ========== TABLA NIVELES ==========
    console.log('\n📐 Verificando tabla niveles...');
    const [nivelesColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' AND TABLE_NAME = 'niveles'
    `);
    
    const nivelesExisting = nivelesColumns.map(col => col.COLUMN_NAME);
    console.log('📋 Columnas existentes en niveles:', nivelesExisting);

    // Agregar columnas faltantes en niveles
    const nivelesRequired = [
      { name: 'nombre', type: 'VARCHAR(255) NOT NULL' },
      { name: 'numero', type: 'INT NOT NULL' },
      { name: 'id_torre', type: 'VARCHAR(191) NOT NULL' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];

    for (const column of nivelesRequired) {
      if (!nivelesExisting.includes(column.name)) {
        console.log(`🔧 Agregando columna ${column.name} a niveles...`);
        await connection.execute(`
          ALTER TABLE niveles ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`✅ Columna ${column.name} agregada a niveles`);
      } else {
        console.log(`✅ Columna ${column.name} ya existe en niveles`);
      }
    }

    // ========== TABLA DEPARTAMENTOS ==========
    console.log('\n🏠 Verificando tabla departamentos...');
    const [departamentosColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' AND TABLE_NAME = 'departamentos'
    `);
    
    const departamentosExisting = departamentosColumns.map(col => col.COLUMN_NAME);
    console.log('📋 Columnas existentes en departamentos:', departamentosExisting);

    // Agregar columnas faltantes en departamentos
    const departamentosRequired = [
      { name: 'nombre', type: 'VARCHAR(255) NOT NULL' },
      { name: 'descripcion', type: 'VARCHAR(500) NULL' },
      { name: 'id_torre', type: 'VARCHAR(191) NULL' },
      { name: 'id_nivel', type: 'VARCHAR(191) NULL' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];

    for (const column of departamentosRequired) {
      if (!departamentosExisting.includes(column.name)) {
        console.log(`🔧 Agregando columna ${column.name} a departamentos...`);
        await connection.execute(`
          ALTER TABLE departamentos ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`✅ Columna ${column.name} agregada a departamentos`);
      } else {
        console.log(`✅ Columna ${column.name} ya existe en departamentos`);
      }
    }

    // ========== TABLA COMPANEROS ==========
    console.log('\n👥 Verificando tabla companeros...');
    const [companerosColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' AND TABLE_NAME = 'companeros'
    `);
    
    const companerosExisting = companerosColumns.map(col => col.COLUMN_NAME);
    console.log('📋 Columnas existentes en companeros:', companerosExisting);

    // Agregar columnas faltantes en companeros
    const companerosRequired = [
      { name: 'id_departamento', type: 'VARCHAR(191) NULL' },
      { name: 'createdById', type: 'VARCHAR(191) NOT NULL' }
    ];

    for (const column of companerosRequired) {
      if (!companerosExisting.includes(column.name)) {
        console.log(`🔧 Agregando columna ${column.name} a companeros...`);
        if (column.name === 'createdById') {
          // Para createdById, usar un valor por defecto temporal
          await connection.execute(`
            ALTER TABLE companeros ADD COLUMN ${column.name} ${column.type} DEFAULT 'admin_1757376577345_1e0rksfl9'
          `);
        } else {
          await connection.execute(`
            ALTER TABLE companeros ADD COLUMN ${column.name} ${column.type}
          `);
        }
        console.log(`✅ Columna ${column.name} agregada a companeros`);
      } else {
        console.log(`✅ Columna ${column.name} ya existe en companeros`);
      }
    }

    // ========== VERIFICACIÓN FINAL ==========
    console.log('\n🔍 Verificación final de todas las tablas...');
    
    const tables = ['torres', 'niveles', 'departamentos', 'companeros'];
    for (const table of tables) {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'urban_nest_db' AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [table]);

      console.log(`\n📋 Estructura final de ${table}:`);
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    console.log('\n✅ ¡Sincronización completada exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await connection.end();
  }
}

syncAllTables();
