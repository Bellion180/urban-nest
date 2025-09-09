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
    console.log('🔄 Sincronizando todas las tablas con el schema de Prisma...\n');

    // 1. Verificar y arreglar tabla companeros
    console.log('📋 1. Verificando tabla companeros...');
    const [companerosColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' 
        AND TABLE_NAME = 'companeros'
    `);

    const companerosExistingColumns = companerosColumns.map(col => col.COLUMN_NAME);
    console.log('   Columnas existentes:', companerosExistingColumns);

    const companerosRequiredColumns = [
      { name: 'id_departamento', type: 'VARCHAR(191) NULL' },
      { name: 'createdById', type: 'VARCHAR(191) NOT NULL' }
    ];

    for (const column of companerosRequiredColumns) {
      if (!companerosExistingColumns.includes(column.name)) {
        console.log(`   🔧 Agregando columna: ${column.name}`);
        await connection.execute(`
          ALTER TABLE companeros ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`   ✅ Columna ${column.name} agregada`);
      } else {
        console.log(`   ✅ Columna ${column.name} ya existe`);
      }
    }

    // 2. Verificar y arreglar tabla niveles
    console.log('\n📋 2. Verificando tabla niveles...');
    const [nivelesColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' 
        AND TABLE_NAME = 'niveles'
    `);

    const nivelesExistingColumns = nivelesColumns.map(col => col.COLUMN_NAME);
    console.log('   Columnas existentes:', nivelesExistingColumns);

    const nivelesRequiredColumns = [
      { name: 'nombre', type: 'VARCHAR(191) NOT NULL' },
      { name: 'numero', type: 'INT NOT NULL' },
      { name: 'id_torre', type: 'VARCHAR(191) NOT NULL' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];

    for (const column of nivelesRequiredColumns) {
      if (!nivelesExistingColumns.includes(column.name)) {
        console.log(`   🔧 Agregando columna: ${column.name}`);
        await connection.execute(`
          ALTER TABLE niveles ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`   ✅ Columna ${column.name} agregada`);
      } else {
        console.log(`   ✅ Columna ${column.name} ya existe`);
      }
    }

    // 3. Verificar y arreglar tabla departamentos
    console.log('\n📋 3. Verificando tabla departamentos...');
    const [departamentosColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' 
        AND TABLE_NAME = 'departamentos'
    `);

    const departamentosExistingColumns = departamentosColumns.map(col => col.COLUMN_NAME);
    console.log('   Columnas existentes:', departamentosExistingColumns);

    const departamentosRequiredColumns = [
      { name: 'id_departamento', type: 'VARCHAR(191) NOT NULL PRIMARY KEY' },
      { name: 'nombre', type: 'VARCHAR(191) NOT NULL' },
      { name: 'descripcion', type: 'VARCHAR(500) NULL' },
      { name: 'id_torre', type: 'VARCHAR(191) NULL' },
      { name: 'id_nivel', type: 'VARCHAR(191) NULL' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];

    for (const column of departamentosRequiredColumns) {
      if (!departamentosExistingColumns.includes(column.name)) {
        console.log(`   🔧 Agregando columna: ${column.name}`);
        try {
          if (column.name === 'id_departamento' && column.type.includes('PRIMARY KEY')) {
            // Manejar clave primaria por separado
            await connection.execute(`
              ALTER TABLE departamentos ADD COLUMN ${column.name} VARCHAR(191) NOT NULL
            `);
            await connection.execute(`
              ALTER TABLE departamentos ADD PRIMARY KEY (${column.name})
            `);
          } else {
            await connection.execute(`
              ALTER TABLE departamentos ADD COLUMN ${column.name} ${column.type}
            `);
          }
          console.log(`   ✅ Columna ${column.name} agregada`);
        } catch (error) {
          console.log(`   ⚠️ Error agregando ${column.name}:`, error.message);
        }
      } else {
        console.log(`   ✅ Columna ${column.name} ya existe`);
      }
    }

    // 4. Verificar tabla users
    console.log('\n📋 4. Verificando tabla users...');
    const [usersColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' 
        AND TABLE_NAME = 'users'
    `);

    const usersExistingColumns = usersColumns.map(col => col.COLUMN_NAME);
    console.log('   Columnas existentes:', usersExistingColumns);

    const usersRequiredColumns = [
      { name: 'id', type: 'VARCHAR(191) NOT NULL PRIMARY KEY' },
      { name: 'email', type: 'VARCHAR(191) NOT NULL UNIQUE' },
      { name: 'password', type: 'VARCHAR(191) NOT NULL' },
      { name: 'name', type: 'VARCHAR(191) NULL' },
      { name: 'role', type: 'ENUM("ADMIN", "RESIDENT") DEFAULT "ADMIN"' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];

    for (const column of usersRequiredColumns) {
      if (!usersExistingColumns.includes(column.name)) {
        console.log(`   🔧 Agregando columna: ${column.name}`);
        try {
          if (column.name === 'id' && column.type.includes('PRIMARY KEY')) {
            await connection.execute(`
              ALTER TABLE users ADD COLUMN ${column.name} VARCHAR(191) NOT NULL
            `);
            await connection.execute(`
              ALTER TABLE users ADD PRIMARY KEY (${column.name})
            `);
          } else {
            await connection.execute(`
              ALTER TABLE users ADD COLUMN ${column.name} ${column.type}
            `);
          }
          console.log(`   ✅ Columna ${column.name} agregada`);
        } catch (error) {
          console.log(`   ⚠️ Error agregando ${column.name}:`, error.message);
        }
      } else {
        console.log(`   ✅ Columna ${column.name} ya existe`);
      }
    }

    // Mostrar estructura final
    console.log('\n📊 Estructura final de las tablas:');
    
    const tables = ['torres', 'niveles', 'departamentos', 'companeros', 'users'];
    
    for (const table of tables) {
      console.log(`\n🏛️ Tabla ${table}:`);
      try {
        const [columns] = await connection.execute(`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = 'urban_nest_db' 
            AND TABLE_NAME = '${table}'
          ORDER BY ORDINAL_POSITION
        `);

        columns.forEach(col => {
          const key = col.COLUMN_KEY ? ` [${col.COLUMN_KEY}]` : '';
          const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
          console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${nullable}${key}`);
        });
      } catch (error) {
        console.log(`   ❌ Error obteniendo estructura de ${table}:`, error.message);
      }
    }

    console.log('\n✅ ¡Sincronización completada!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await connection.end();
  }
}

syncAllTables();
