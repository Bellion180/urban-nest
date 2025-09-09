const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMissingFloorImages() {
  console.log('🖼️ Agregando imágenes faltantes de pisos...\n');

  try {
    // Obtener edificios que tienen imágenes de piso disponibles
    const buildingsWithImages = [
      'cmfbw9xex0000fafgj0jteq0y', // naty
      'cmfbwtue30006fafgotaz5e5m', // layo  
      'cmfbyl8mv0000fa9ogcfe7gp7'  // la pta
    ];

    // Obtener todos los edificios con sus niveles
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

    for (const building of buildings) {
      const buildingId = building.id_torre;
      const buildingPath = path.join(__dirname, 'public', 'edificios', buildingId, 'pisos');

      console.log(`🏢 Procesando edificio: ${building.letra || building.nombre} (${buildingId})`);

      // Verificar si este edificio ya tiene imágenes
      const hasImages = buildingsWithImages.includes(buildingId);
      
      if (hasImages) {
        console.log(`   ✅ Ya tiene imágenes, saltando...`);
        continue;
      }

      // Obtener una imagen de referencia de otro edificio
      let sourceImage = null;
      for (const sourceBuilding of buildingsWithImages) {
        const sourcePath = path.join(__dirname, 'public', 'edificios', sourceBuilding, 'pisos', '1', 'piso.jpg');
        if (fs.existsSync(sourcePath)) {
          sourceImage = sourcePath;
          console.log(`   📸 Usando imagen de referencia: ${sourceBuilding}`);
          break;
        }
      }

      if (!sourceImage) {
        console.log(`   ❌ No se encontró imagen de referencia`);
        continue;
      }

      // Crear imágenes para cada nivel
      let imagesCopied = 0;
      for (const nivel of building.niveles) {
        const nivelNumber = nivel.numero;
        const nivelPath = path.join(buildingPath, nivelNumber.toString());
        const targetImagePath = path.join(nivelPath, 'piso.jpg');

        // Crear carpeta del nivel si no existe
        if (!fs.existsSync(nivelPath)) {
          fs.mkdirSync(nivelPath, { recursive: true });
        }

        // Copiar imagen si no existe
        if (!fs.existsSync(targetImagePath)) {
          fs.copyFileSync(sourceImage, targetImagePath);
          console.log(`   📋 Nivel ${nivelNumber}: ✅ Imagen copiada`);
          imagesCopied++;
        } else {
          console.log(`   📋 Nivel ${nivelNumber}: ✅ Ya existe`);
        }
      }

      console.log(`   📊 Resumen: ${imagesCopied} imágenes agregadas de ${building.niveles.length} niveles\n`);
    }

    // Verificar resultado final
    console.log('📊 RESUMEN FINAL:\n');
    
    for (const building of buildings) {
      const buildingId = building.id_torre;
      console.log(`🏢 ${building.letra || building.nombre}:`);
      
      let hasAllImages = true;
      for (const nivel of building.niveles) {
        const imagePath = path.join(__dirname, 'public', 'edificios', buildingId, 'pisos', nivel.numero.toString(), 'piso.jpg');
        const exists = fs.existsSync(imagePath);
        console.log(`   Nivel ${nivel.numero}: ${exists ? '✅' : '❌'}`);
        if (!exists) hasAllImages = false;
      }
      
      console.log(`   Estado: ${hasAllImages ? '🎉 COMPLETO' : '⚠️ INCOMPLETO'}\n`);
    }

    console.log('🎉 Proceso completado!');

  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingFloorImages();
