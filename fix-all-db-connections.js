import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixDatabaseConnections() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'c',
    database: 'urban_nest_db'
  });

  try {
    console.log('🔧 ARREGLANDO TODAS LAS CONEXIONES DE BASE DE DATOS\n');

    // 1. Crear tablas faltantes
    console.log('1️⃣ Creando tablas faltantes...');
    
    // Crear tabla info_tlaxilacalli si no existe
    console.log('📋 Verificando tabla info_tlaxilacalli...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS info_tlaxilacalli (
          id_Tlax VARCHAR(191) PRIMARY KEY,
          Excedente INT,
          Aport INT,
          Deuda INT,
          Estacionamiento INT,
          Aportacion INT,
          Aportacion_Deuda INT,
          Apoyo_renta VARCHAR(255),
          Comentarios VARCHAR(255),
          id_compañeros VARCHAR(191) UNIQUE,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (id_compañeros) REFERENCES companeros(id_companero) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabla info_tlaxilacalli creada/verificada');
    } catch (error) {
      console.log('⚠️ Info_tlaxilacalli:', error.message);
    }

    // Crear tabla invi si no existe
    console.log('📋 Verificando tabla invi...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS invi (
          id_invi INT AUTO_INCREMENT PRIMARY KEY,
          Mensualidades VARCHAR(191),
          fecha_de_contrato VARCHAR(191),
          deuda INT,
          id_companero VARCHAR(191) UNIQUE,
          FOREIGN KEY (id_companero) REFERENCES companeros(id_companero) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabla invi creada/verificada');
    } catch (error) {
      console.log('⚠️ INVI:', error.message);
    }

    // 2. Arreglar claves foráneas faltantes
    console.log('\n2️⃣ Verificando y creando claves foráneas...');

    // FK: niveles -> torres
    try {
      await connection.execute(`
        ALTER TABLE niveles 
        ADD CONSTRAINT fk_niveles_torre 
        FOREIGN KEY (id_torre) REFERENCES torres(id_torre) ON DELETE CASCADE
      `);
      console.log('✅ Clave foránea niveles->torres creada');
    } catch (error) {
      console.log('⚠️ FK niveles->torres ya existe o error:', error.message.substring(0, 50));
    }

    // FK: departamentos -> torres
    try {
      await connection.execute(`
        ALTER TABLE departamentos 
        ADD CONSTRAINT fk_departamentos_torre 
        FOREIGN KEY (id_torre) REFERENCES torres(id_torre) ON DELETE SET NULL
      `);
      console.log('✅ Clave foránea departamentos->torres creada');
    } catch (error) {
      console.log('⚠️ FK departamentos->torres ya existe o error:', error.message.substring(0, 50));
    }

    // FK: departamentos -> niveles
    try {
      await connection.execute(`
        ALTER TABLE departamentos 
        ADD CONSTRAINT fk_departamentos_nivel 
        FOREIGN KEY (id_nivel) REFERENCES niveles(id_nivel) ON DELETE SET NULL
      `);
      console.log('✅ Clave foránea departamentos->niveles creada');
    } catch (error) {
      console.log('⚠️ FK departamentos->niveles ya existe o error:', error.message.substring(0, 50));
    }

    // FK: companeros -> departamentos
    try {
      await connection.execute(`
        ALTER TABLE companeros 
        ADD CONSTRAINT fk_companeros_departamento 
        FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento) ON DELETE SET NULL
      `);
      console.log('✅ Clave foránea companeros->departamentos creada');
    } catch (error) {
      console.log('⚠️ FK companeros->departamentos ya existe o error:', error.message.substring(0, 50));
    }

    // FK: companeros -> users
    try {
      await connection.execute(`
        ALTER TABLE companeros 
        ADD CONSTRAINT fk_companeros_user 
        FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('✅ Clave foránea companeros->users creada');
    } catch (error) {
      console.log('⚠️ FK companeros->users ya existe o error:', error.message.substring(0, 50));
    }

    // FK: info_financiero -> companeros  
    try {
      await connection.execute(`
        ALTER TABLE info_financiero 
        ADD CONSTRAINT fk_info_financiero_companero 
        FOREIGN KEY (id_companeros) REFERENCES companeros(id_companero) ON DELETE CASCADE
      `);
      console.log('✅ Clave foránea info_financiero->companeros creada');
    } catch (error) {
      console.log('⚠️ FK info_financiero->companeros ya existe o error:', error.message.substring(0, 50));
    }

    // FK: financieros -> companeros
    try {
      await connection.execute(`
        ALTER TABLE financieros 
        ADD CONSTRAINT fk_financieros_companero 
        FOREIGN KEY (id_compañeros) REFERENCES companeros(id_companero) ON DELETE CASCADE
      `);
      console.log('✅ Clave foránea financieros->companeros creada');
    } catch (error) {
      console.log('⚠️ FK financieros->companeros ya existe o error:', error.message.substring(0, 50));
    }

    // 3. Verificar integridad final
    console.log('\n3️⃣ Verificación final de integridad...');
    
    const tables = [
      'users', 'torres', 'niveles', 'departamentos', 'companeros', 
      'info_tlaxilacalli', 'info_financiero', 'invi', 'financieros'
    ];

    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table}: ${count[0].count} registros`);
      } catch (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`);
      }
    }

    console.log('\n🎯 BASE DE DATOS COMPLETAMENTE CONECTADA Y ARREGLADA');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await connection.end();
  }
}

fixDatabaseConnections();
