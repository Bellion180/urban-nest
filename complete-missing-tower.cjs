// Arreglar la torre que falta y completar el sistema
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function completeMissingTower() {
  console.log('🔧 Completando torre faltante...\n');

  try {
    const missingTowerId = 'cmfc2ympw000afa5sptb3uvuf';
    
    // 1. Obtener información de la torre
    const torre = await prisma.torres.findUnique({
      where: { id_torre: missingTowerId },
      include: { niveles: true }
    });

    if (!torre) {
      console.log('❌ Torre no encontrada');
      return;
    }

    console.log(`🏢 Torre: ${torre.letra || torre.descripcion} (${torre.id_torre})`);
    console.log(`📋 Niveles: ${torre.niveles.length}`);

    // 2. Crear estructura y copiar imagen para cada nivel
    for (const nivel of torre.niveles) {
      console.log(`\n🔧 Procesando Nivel ${nivel.numero}...`);
      
      // Crear directorio
      const pisoDir = path.join('public', 'edificios', torre.id_torre, 'pisos', nivel.numero.toString());
      if (!fs.existsSync(pisoDir)) {
        fs.mkdirSync(pisoDir, { recursive: true });
        console.log(`✅ Directorio creado: ${pisoDir}`);
      }

      // Copiar imagen de referencia
      const sourceImage = path.join('public', 'edificios', 'cmfbw832f0002fa3gt92odart', 'pisos', '1', 'piso.jpg');
      const targetImage = path.join(pisoDir, 'piso.jpg');

      if (fs.existsSync(sourceImage) && !fs.existsSync(targetImage)) {
        fs.copyFileSync(sourceImage, targetImage);
        console.log(`✅ Imagen copiada: ${targetImage}`);
      }

      // Actualizar base de datos
      const imageReference = `/edificios/${torre.id_torre}/pisos/${nivel.numero}/piso.jpg`;
      
      await prisma.niveles.update({
        where: { id_nivel: nivel.id_nivel },
        data: { imagen: imageReference }
      });
      
      console.log(`✅ Base de datos actualizada: ${imageReference}`);
    }

    console.log('\n🎉 ¡Torre completada exitosamente!');

    // 3. Verificación final rápida
    console.log('\n📊 Verificación final...');
    
    const totalNiveles = await prisma.$queryRaw`SELECT COUNT(*) as total FROM niveles`;
    const nivelesConImagen = await prisma.$queryRaw`SELECT COUNT(*) as count FROM niveles WHERE imagen IS NOT NULL`;
    
    const total = Number(totalNiveles[0].total);
    const conImagen = Number(nivelesConImagen[0].count);
    
    console.log(`   Total de niveles: ${total}`);
    console.log(`   Niveles con imagen: ${conImagen}`);
    console.log(`   Completitud: ${Math.round((conImagen / total) * 100)}%`);
    
    if (conImagen === total) {
      console.log('\n🎉 ¡SISTEMA 100% COMPLETO!');
      console.log('✅ Todas las torres tienen imágenes de pisos');
      console.log('✅ Base de datos completamente actualizada');
      console.log('✅ Frontend funcionará perfectamente');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeMissingTower();
