// Script final de verificación y reporte del sistema de imágenes
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function finalVerification() {
  console.log('🔍 VERIFICACIÓN FINAL - SISTEMA DE IMÁGENES DE PISOS\n');

  try {
    // 1. Verificar estructura de base de datos
    console.log('1️⃣ Verificando estructura de base de datos...');
    
    // Verificar si el campo imagen existe en la tabla niveles
    try {
      const testQuery = await prisma.$queryRaw`
        SELECT imagen FROM niveles LIMIT 1
      `;
      console.log('✅ Campo "imagen" existe en tabla niveles');
    } catch (error) {
      console.log('❌ Campo "imagen" NO existe en tabla niveles');
      console.log('   Error:', error.message);
    }

    // 2. Verificar torres y niveles
    console.log('\n2️⃣ Verificando torres y niveles...');
    
    const torres = await prisma.torres.findMany({
      include: {
        niveles: {
          orderBy: { numero: 'asc' }
        }
      }
    });

    console.log(`✅ Se encontraron ${torres.length} torres en total\n`);

    for (const torre of torres) {
      console.log(`🏢 Torre: ${torre.letra || torre.descripcion} (${torre.id_torre})`);
      console.log(`   Imagen principal: ${torre.imagen ? '✅' : '❌'} ${torre.imagen || 'Sin imagen'}`);
      console.log(`   Niveles: ${torre.niveles.length}`);

      // Verificar cada nivel
      for (const nivel of torre.niveles) {
        const imagenDB = nivel.imagen || null;
        let archivoExiste = false;
        let rutaArchivo = '';

        if (imagenDB) {
          rutaArchivo = path.join('public', imagenDB);
          archivoExiste = fs.existsSync(rutaArchivo);
        } else {
          // Verificar ruta estándar
          rutaArchivo = path.join('public', 'edificios', torre.id_torre, 'pisos', nivel.numero.toString(), 'piso.jpg');
          archivoExiste = fs.existsSync(rutaArchivo);
        }

        const statusDB = imagenDB ? '✅' : '❌';
        const statusArchivo = archivoExiste ? '✅' : '❌';
        
        console.log(`     Nivel ${nivel.numero}: DB ${statusDB} | Archivo ${statusArchivo}`);
        if (imagenDB) {
          console.log(`       BD: ${imagenDB}`);
        }
        if (archivoExiste) {
          console.log(`       Archivo: ${rutaArchivo}`);
        }
      }
      console.log('');
    }

    // 3. Verificar URLs que usa el frontend
    console.log('3️⃣ Verificando URLs del frontend...');
    
    const testBuilding = torres[0];
    if (testBuilding) {
      console.log(`\n🎯 Probando URLs para torre: ${testBuilding.letra}`);
      
      for (const nivel of testBuilding.niveles) {
        // Esta es la URL que usa SeleccionNivel.tsx
        const frontendURL = `/edificios/${testBuilding.id_torre}/pisos/${nivel.numero}/piso.jpg`;
        const fullPath = path.join('public', frontendURL);
        const exists = fs.existsSync(fullPath);
        
        console.log(`   Nivel ${nivel.numero}: ${exists ? '✅' : '❌'} ${frontendURL}`);
        
        if (exists) {
          const stats = fs.statSync(fullPath);
          console.log(`     Tamaño: ${stats.size} bytes`);
          console.log(`     Modificado: ${stats.mtime.toISOString()}`);
        }
      }
    }

    // 4. Generar reporte final
    console.log('\n4️⃣ Reporte final del sistema...');
    
    const totalNiveles = await prisma.$queryRaw`SELECT COUNT(*) as total FROM niveles`;
    const nivelesConImagen = await prisma.$queryRaw`SELECT COUNT(*) as count FROM niveles WHERE imagen IS NOT NULL`;
    
    const total = Number(totalNiveles[0].total);
    const conImagen = Number(nivelesConImagen[0].count);
    
    console.log(`\n📊 ESTADÍSTICAS:`);
    console.log(`   Total de torres: ${torres.length}`);
    console.log(`   Total de niveles: ${total}`);
    console.log(`   Niveles con imagen en BD: ${conImagen}`);
    console.log(`   Porcentaje completado: ${Math.round((conImagen / total) * 100)}%`);
    
    // Verificar archivos físicos
    let archivosExistentes = 0;
    for (const torre of torres) {
      for (const nivel of torre.niveles) {
        const rutaEstandar = path.join('public', 'edificios', torre.id_torre, 'pisos', nivel.numero.toString(), 'piso.jpg');
        if (fs.existsSync(rutaEstandar)) {
          archivosExistentes++;
        }
      }
    }
    
    console.log(`   Archivos físicos existentes: ${archivosExistentes}`);
    console.log(`   Porcentaje archivos: ${Math.round((archivosExistentes / total) * 100)}%`);
    
    // 5. Estado del sistema
    console.log(`\n🎯 ESTADO DEL SISTEMA:`);
    
    const sistemaCompleto = (conImagen === total) && (archivosExistentes === total);
    
    if (sistemaCompleto) {
      console.log('   🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!');
      console.log('   ✅ Todas las imágenes están en su lugar');
      console.log('   ✅ Base de datos actualizada correctamente');
      console.log('   ✅ Frontend debería mostrar todas las imágenes');
    } else {
      console.log('   ⚠️ Sistema parcialmente funcional');
      if (conImagen < total) {
        console.log(`   ❌ Faltan ${total - conImagen} referencias en BD`);
      }
      if (archivosExistentes < total) {
        console.log(`   ❌ Faltan ${total - archivosExistentes} archivos físicos`);
      }
    }
    
    console.log(`\n🌐 URLS DE PRUEBA RECOMENDADAS:`);
    console.log('   Frontend: http://localhost:8081');
    console.log('   Dashboard: http://localhost:8081/dashboard');
    if (torres.length > 0) {
      console.log(`   Niveles de primera torre: http://localhost:8081/building/${torres[0].id_torre}/niveles`);
    }

  } catch (error) {
    console.error('❌ Error en verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalVerification();
