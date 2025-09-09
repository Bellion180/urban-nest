import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

async function verifyCompleteDBConnection() {
  console.log('🔍 VERIFICACIÓN COMPLETA DE CONEXIÓN A BASE DE DATOS\n');
  
  // 1. Verificar conexión directa a MySQL
  console.log('1️⃣ Verificando conexión directa a MySQL...');
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'c',
      database: 'urban_nest_db'
    });
    
    console.log('✅ Conexión directa a MySQL exitosa');
    
    // Verificar que existe la base de datos
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === 'urban_nest_db');
    console.log(`✅ Base de datos 'urban_nest_db' ${dbExists ? 'existe' : 'NO EXISTE'}`);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error en conexión directa MySQL:', error.message);
    return;
  }

  // 2. Verificar conexión de Prisma
  console.log('\n2️⃣ Verificando conexión de Prisma...');
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('✅ Conexión de Prisma exitosa');
    
    // Verificar que puede hacer queries
    const userCount = await prisma.users.count();
    console.log(`✅ Prisma puede consultar: ${userCount} usuarios encontrados`);
    
  } catch (error) {
    console.error('❌ Error en conexión Prisma:', error.message);
  }

  // 3. Verificar todas las tablas del schema
  console.log('\n3️⃣ Verificando estructura de todas las tablas...');
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'c',
    database: 'urban_nest_db'
  });

  const expectedTables = [
    'users',
    'torres',
    'niveles', 
    'departamentos',
    'companeros',
    'info_tlaxilacalli',
    'info_financiero',
    'invi',
    'financieros'
  ];

  for (const tableName of expectedTables) {
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'urban_nest_db' 
          AND TABLE_NAME = '${tableName}'
        ORDER BY ORDINAL_POSITION
      `);

      if (columns.length > 0) {
        console.log(`✅ Tabla '${tableName}': ${columns.length} columnas`);
        
        // Verificar datos
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   📊 Registros: ${rows[0].count}`);
      } else {
        console.log(`❌ Tabla '${tableName}': NO EXISTE`);
      }
    } catch (error) {
      console.log(`❌ Error verificando tabla '${tableName}':`, error.message);
    }
  }

  // 4. Verificar relaciones entre tablas
  console.log('\n4️⃣ Verificando relaciones entre tablas...');
  try {
    // Verificar relación torres -> niveles
    const [torreNiveles] = await connection.execute(`
      SELECT t.letra, COUNT(n.id_nivel) as niveles_count
      FROM torres t 
      LEFT JOIN niveles n ON t.id_torre = n.id_torre 
      GROUP BY t.id_torre, t.letra
    `);
    console.log(`✅ Relación torres->niveles: ${torreNiveles.length} torres verificadas`);

    // Verificar relación niveles -> departamentos  
    const [nivelDepts] = await connection.execute(`
      SELECT n.nombre, COUNT(d.id_departamento) as depts_count
      FROM niveles n
      LEFT JOIN departamentos d ON n.id_nivel = d.id_nivel
      GROUP BY n.id_nivel, n.nombre
    `);
    console.log(`✅ Relación niveles->departamentos: ${nivelDepts.length} niveles verificados`);

    // Verificar relación departamentos -> companeros
    const [deptCompaneros] = await connection.execute(`
      SELECT d.nombre, COUNT(c.id_companero) as companeros_count  
      FROM departamentos d
      LEFT JOIN companeros c ON d.id_departamento = c.id_departamento
      GROUP BY d.id_departamento, d.nombre
    `);
    console.log(`✅ Relación departamentos->companeros: ${deptCompaneros.length} departamentos verificados`);

  } catch (error) {
    console.error('❌ Error verificando relaciones:', error.message);
  }

  // 5. Verificar variables de entorno
  console.log('\n5️⃣ Verificando variables de entorno...');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurada' : '❌ NO configurada'}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurada' : '❌ NO configurada'}`);
  console.log(`PORT: ${process.env.PORT || 'Por defecto (3001)'}`);

  await connection.end();
  await prisma.$disconnect();
  
  console.log('\n🎯 VERIFICACIÓN COMPLETA TERMINADA');
  console.log('Si todos los elementos muestran ✅, la base de datos está correctamente conectada');
}

verifyCompleteDBConnection().catch(console.error);
