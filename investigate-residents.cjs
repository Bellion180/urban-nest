// Script para verificar estructura de residentes en la base de datos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function investigateResidentsStructure() {
  console.log('🔍 INVESTIGANDO ESTRUCTURA DE RESIDENTES EN LA BASE DE DATOS\n');

  try {
    // 1. Verificar tabla companeros
    console.log('1️⃣ Verificando tabla companeros...');
    
    const companeros = await prisma.companeros.findMany({
      take: 3,
      include: {
        departamento: {
          include: {
            torre: true,
            nivel: true
          }
        }
      }
    });

    console.log(`✅ Encontrados ${companeros.length} companeros (muestra)`);
    
    if (companeros.length > 0) {
      console.log('\n📋 Estructura de companeros:');
      const firstCompanero = companeros[0];
      console.log('Campos disponibles:', Object.keys(firstCompanero));
      
      console.log('\n🎯 ¿Existe campo profilePhoto?', 'profilePhoto' in firstCompanero ? '✅ SÍ' : '❌ NO');
      
      console.log('\n📝 Ejemplo de companero:');
      console.log(`   ID: ${firstCompanero.id_companero}`);
      console.log(`   Nombre: ${firstCompanero.nombre} ${firstCompanero.apellidos}`);
      console.log(`   Estatus: ${firstCompanero.estatus}`);
      console.log(`   Departamento: ${firstCompanero.departamento?.no_departamento || 'Sin departamento'}`);
      console.log(`   Torre: ${firstCompanero.departamento?.torre?.letra || 'Sin torre'}`);
    }

    // 2. Intentar verificar tabla residents (debería fallar)
    console.log('\n2️⃣ Verificando tabla residents...');
    
    try {
      const residents = await prisma.resident.findMany({ take: 1 });
      console.log('✅ Tabla residents existe y tiene datos');
    } catch (error) {
      console.log('❌ Tabla residents NO existe o hay error:', error.message);
    }

    // 3. Verificar si companeros tiene algún campo relacionado con fotos
    console.log('\n3️⃣ Verificando campos de imagen en companeros...');
    
    try {
      // Intentar query SQL crudo para ver la estructura completa
      const tableInfo = await prisma.$queryRaw`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'urban_nest_db' 
        AND TABLE_NAME = 'companeros'
        ORDER BY ORDINAL_POSITION
      `;
      
      console.log('📋 Estructura completa de la tabla companeros:');
      tableInfo.forEach(column => {
        const hasImage = column.COLUMN_NAME.toLowerCase().includes('foto') || 
                        column.COLUMN_NAME.toLowerCase().includes('image') ||
                        column.COLUMN_NAME.toLowerCase().includes('photo');
        const indicator = hasImage ? '🖼️' : '  ';
        console.log(`   ${indicator} ${column.COLUMN_NAME} (${column.DATA_TYPE})`);
      });
      
    } catch (error) {
      console.log('❌ Error obteniendo estructura:', error.message);
    }

    // 4. Verificar si existe tabla residents en la base de datos
    console.log('\n4️⃣ Verificando existencia de tabla residents...');
    
    try {
      const tableExists = await prisma.$queryRaw`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'urban_nest_db' 
        AND TABLE_NAME = 'residents'
      `;
      
      if (tableExists.length > 0) {
        console.log('✅ Tabla residents existe en la base de datos');
        
        // Mostrar estructura de residents
        const residentsInfo = await prisma.$queryRaw`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = 'urban_nest_db' 
          AND TABLE_NAME = 'residents'
          ORDER BY ORDINAL_POSITION
        `;
        
        console.log('📋 Estructura de la tabla residents:');
        residentsInfo.forEach(column => {
          const hasImage = column.COLUMN_NAME.toLowerCase().includes('foto') || 
                          column.COLUMN_NAME.toLowerCase().includes('image') ||
                          column.COLUMN_NAME.toLowerCase().includes('photo');
          const indicator = hasImage ? '🖼️' : '  ';
          console.log(`   ${indicator} ${column.COLUMN_NAME} (${column.DATA_TYPE})`);
        });
        
      } else {
        console.log('❌ Tabla residents NO existe en la base de datos');
      }
      
    } catch (error) {
      console.log('❌ Error verificando tabla residents:', error.message);
    }

    console.log('\n🎯 CONCLUSIONES:');
    console.log('================');
    console.log('- El schema actual solo tiene tabla "companeros"');
    console.log('- El código backend usa "prisma.resident" (que no existe)');
    console.log('- Necesitamos agregar campo profilePhoto a companeros');
    console.log('- O crear tabla residents con los campos necesarios');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateResidentsStructure();
