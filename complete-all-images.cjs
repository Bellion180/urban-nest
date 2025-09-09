const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function completeAllBuildingImages() {
  console.log('🎨 Completando imágenes para todos los edificios...\n');

  try {
    // Obtener todos los edificios
    const buildings = await prisma.torres.findMany({
      include: {
        niveles: {
          orderBy: {
            numero: 'asc'
          }
        }
      }
    });

    console.log(`📋 Procesando ${buildings.length} edificios\n`);

    // Imagen de referencia
    const sourceImage = path.join(__dirname, 'public', 'edificios', 'cmfbw9xex0000fafgj0jteq0y', 'edificio.jpg');
    const sourceFloorImage = path.join(__dirname, 'public', 'edificios', 'cmfbw9xex0000fafgj0jteq0y', 'pisos', '1', 'piso.jpg');

    if (!fs.existsSync(sourceImage)) {
      console.error('❌ No se encontró imagen de referencia para edificios');
      return;
    }

    if (!fs.existsSync(sourceFloorImage)) {
      console.error('❌ No se encontró imagen de referencia para pisos');
      return;
    }

    for (const building of buildings) {
      const buildingId = building.id_torre;
      const buildingName = building.letra || building.nombre;
      
      console.log(`🏢 Procesando edificio: ${buildingName} (${buildingId})`);

      // 1. Asegurar imagen principal del edificio
      const buildingPath = path.join(__dirname, 'public', 'edificios', buildingId);
      const buildingImagePath = path.join(buildingPath, 'edificio.jpg');

      if (!fs.existsSync(buildingPath)) {
        fs.mkdirSync(buildingPath, { recursive: true });
      }

      if (!fs.existsSync(buildingImagePath)) {
        fs.copyFileSync(sourceImage, buildingImagePath);
        console.log(`   📸 Imagen principal agregada`);
        
        // Actualizar base de datos
        await prisma.torres.update({
          where: { id_torre: buildingId },
          data: { imagen: `/edificios/${buildingId}/edificio.jpg` }
        });
        console.log(`   💾 Base de datos actualizada con imagen principal`);
      } else {
        console.log(`   ✅ Ya tiene imagen principal`);
      }

      // 2. Asegurar imágenes de todos los niveles
      for (const nivel of building.niveles) {
        const nivelNumber = nivel.numero;
        const nivelPath = path.join(buildingPath, 'pisos', nivelNumber.toString());
        const nivelImagePath = path.join(nivelPath, 'piso.jpg');

        if (!fs.existsSync(nivelPath)) {
          fs.mkdirSync(nivelPath, { recursive: true });
        }

        if (!fs.existsSync(nivelImagePath)) {
          fs.copyFileSync(sourceFloorImage, nivelImagePath);
          console.log(`   📸 Imagen de nivel ${nivelNumber} agregada`);
        } else {
          console.log(`   ✅ Ya tiene imagen de nivel ${nivelNumber}`);
        }
      }

      console.log(`   📊 Resumen: ${building.niveles.length} niveles procesados\n`);
    }

    // Verificar resultado final
    console.log('📊 VERIFICACIÓN FINAL:\n');
    
    for (const building of buildings) {
      const buildingId = building.id_torre;
      const buildingName = building.letra || building.nombre;
      
      console.log(`🏢 ${buildingName}:`);
      
      // Verificar imagen principal
      const mainImagePath = path.join(__dirname, 'public', 'edificios', buildingId, 'edificio.jpg');
      const hasMainImage = fs.existsSync(mainImagePath);
      console.log(`   Imagen principal: ${hasMainImage ? '✅' : '❌'}`);
      
      // Verificar imágenes de niveles
      let allFloorsHaveImages = true;
      for (const nivel of building.niveles) {
        const floorImagePath = path.join(__dirname, 'public', 'edificios', buildingId, 'pisos', nivel.numero.toString(), 'piso.jpg');
        const hasFloorImage = fs.existsSync(floorImagePath);
        console.log(`   Nivel ${nivel.numero}: ${hasFloorImage ? '✅' : '❌'}`);
        if (!hasFloorImage) allFloorsHaveImages = false;
      }
      
      const isComplete = hasMainImage && allFloorsHaveImages;
      console.log(`   Estado: ${isComplete ? '🎉 COMPLETO' : '⚠️ INCOMPLETO'}\n`);
    }

    console.log('🎉 Proceso de completar imágenes terminado!');

  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

completeAllBuildingImages();
