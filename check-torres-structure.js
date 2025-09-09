import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkTorresTableStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'c',
    database: 'urban_nest_db'
  });

  try {
    console.log('🔍 VERIFICANDO ESTRUCTURA ESPECÍFICA DE LA TABLA TORRES\n');

    // 1. Verificar columnas detalladamente
    const [columns] = await connection.execute(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        IS_NULLABLE, 
        COLUMN_KEY, 
        COLUMN_DEFAULT, 
        EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' 
        AND TABLE_NAME = 'torres'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📋 Estructura detallada de la tabla torres:');
    columns.forEach(col => {
      const key = col.COLUMN_KEY ? ` [${col.COLUMN_KEY}]` : '';
      const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultValue = col.COLUMN_DEFAULT !== null ? ` DEFAULT ${col.COLUMN_DEFAULT}` : '';
      const extra = col.EXTRA ? ` ${col.EXTRA}` : '';
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${nullable}${defaultValue}${extra}${key}`);
    });

    // 2. Verificar índices y claves
    console.log('\n🔑 Verificando índices:');
    const [indexes] = await connection.execute(`
      SELECT 
        INDEX_NAME, 
        COLUMN_NAME, 
        NON_UNIQUE
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' 
        AND TABLE_NAME = 'torres'
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `);

    indexes.forEach(idx => {
      const unique = idx.NON_UNIQUE === 0 ? 'UNIQUE' : '';
      console.log(`   - ${idx.INDEX_NAME}: ${idx.COLUMN_NAME} ${unique}`);
    });

    // 3. Verificar definición completa de la tabla
    console.log('\n🏗️ Definición completa de la tabla:');
    const [createTable] = await connection.execute(`SHOW CREATE TABLE torres`);
    console.log(createTable[0]['Create Table']);

    console.log('\n🔧 DIAGNÓSTICO:');
    const idTorreColumn = columns.find(col => col.COLUMN_NAME === 'id_torre');
    
    if (idTorreColumn) {
      console.log(`✅ Campo id_torre existe`);
      console.log(`   - Tipo: ${idTorreColumn.DATA_TYPE}`);
      console.log(`   - Nullable: ${idTorreColumn.IS_NULLABLE}`);
      console.log(`   - Default: ${idTorreColumn.COLUMN_DEFAULT || 'NULL'}`);
      console.log(`   - Extra: ${idTorreColumn.EXTRA || 'none'}`);
      
      if (idTorreColumn.COLUMN_DEFAULT === null && idTorreColumn.IS_NULLABLE === 'NO') {
        console.log('\n❌ PROBLEMA IDENTIFICADO:');
        console.log('   - id_torre es NOT NULL pero no tiene DEFAULT');
        console.log('   - Prisma espera que se genere automáticamente con cuid()');
        console.log('   - La tabla MySQL no tiene configuración para auto-generar IDs');
      } else {
        console.log('\n✅ Campo id_torre configurado correctamente');
      }
    } else {
      console.log('❌ Campo id_torre NO EXISTE en la tabla');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkTorresTableStructure();
