// Script para agregar campo profilePhoto a la tabla companeros
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function addProfilePhotoField() {
  console.log('🔧 Agregando campo profilePhoto a tabla companeros...\n');

  try {
    // 1. Verificar si el campo ya existe
    console.log('1️⃣ Verificando si el campo profilePhoto ya existe...');
    
    try {
      const testQuery = await prisma.$queryRaw`
        SELECT profilePhoto FROM companeros LIMIT 1
      `;
      console.log('✅ Campo "profilePhoto" ya existe en tabla companeros');
    } catch (error) {
      if (error.message.includes('Unknown column')) {
        console.log('❌ Campo "profilePhoto" NO existe, agregándolo...');
        
        // Agregar el campo usando SQL directo
        await prisma.$executeRaw`
          ALTER TABLE companeros ADD COLUMN profilePhoto VARCHAR(255) NULL
        `;
        
        console.log('✅ Campo "profilePhoto" agregado exitosamente');
      } else {
        throw error;
      }
    }

    // 2. Verificar companeros existentes
    console.log('\n2️⃣ Verificando companeros existentes...');
    
    const companeros = await prisma.companeros.findMany({
      include: {
        departamento: {
          include: {
            torre: true,
            nivel: true
          }
        }
      }
    });

    console.log(`✅ Encontrados ${companeros.length} companeros en total`);

    // 3. Mostrar estructura de carpetas esperada para fotos
    console.log('\n3️⃣ Estructura esperada para fotos de perfil:');
    console.log('📁 /edificios/{torreId}/pisos/{nivelId}/apartamentos/{deptId}/perfil.jpg');

    for (const companero of companeros.slice(0, 3)) { // Solo primeros 3 como ejemplo
      console.log(`\n👤 Companero: ${companero.nombre} ${companero.apellidos}`);
      
      if (companero.departamento) {
        const torreId = companero.departamento.id_torre || 'sin-torre';
        const nivelNumero = companero.departamento.nivel?.numero || '1';
        const deptId = companero.departamento.id_departamento;
        
        const expectedPath = `/edificios/${torreId}/pisos/${nivelNumero}/apartamentos/${deptId}/perfil.jpg`;
        const physicalPath = path.join('public', expectedPath);
        
        console.log(`   📋 Departamento: ${companero.departamento.no_departamento}`);
        console.log(`   🏢 Torre: ${companero.departamento.torre?.letra || 'Sin torre'}`);
        console.log(`   📂 Ruta esperada: ${expectedPath}`);
        
        const exists = fs.existsSync(physicalPath);
        console.log(`   🖼️ Foto existe: ${exists ? '✅' : '❌'}`);
        
        // Si existe la foto, actualizar la base de datos
        if (exists) {
          await prisma.companeros.update({
            where: { id_companero: companero.id_companero },
            data: { profilePhoto: expectedPath }
          });
          console.log(`   ✅ Base de datos actualizada con: ${expectedPath}`);
        }
      } else {
        console.log(`   ❌ Sin departamento asignado`);
      }
    }

    // 4. Resumen final
    console.log('\n4️⃣ Resumen final...');
    
    const totalCompaneros = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM companeros
    `;
    
    const companerosSinFoto = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM companeros WHERE profilePhoto IS NULL
    `;
    
    const companerosConFoto = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM companeros WHERE profilePhoto IS NOT NULL
    `;
    
    const total = Number(totalCompaneros[0].total);
    const sinFoto = Number(companerosSinFoto[0].count);
    const conFoto = Number(companerosConFoto[0].count);
    
    console.log(`📊 Estadísticas:`);
    console.log(`   Total companeros: ${total}`);
    console.log(`   Con foto: ${conFoto}`);
    console.log(`   Sin foto: ${sinFoto}`);
    console.log(`   Completitud: ${Math.round((conFoto / total) * 100)}%`);

    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('=================');
    console.log('1. ✅ Campo profilePhoto agregado a companeros');
    console.log('2. 🔧 Actualizar rutas del backend para usar companeros en lugar de residents');
    console.log('3. 🖼️ Crear estructura de carpetas para fotos de perfil');
    console.log('4. 🧪 Probar subida de fotos desde el frontend');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addProfilePhotoField();
