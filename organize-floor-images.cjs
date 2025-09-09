const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function organizeFloorImages() {
  console.log('🏗️ Organizando imágenes de pisos...\n');

  try {
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

    console.log(`📋 Encontrados ${buildings.length} edificios\n`);

    for (const building of buildings) {
      const buildingId = building.id_torre;
      const buildingPath = path.join(__dirname, 'public', 'edificios', buildingId);
      const pisosPath = path.join(buildingPath, 'pisos');

      console.log(`🏢 Procesando edificio: ${building.letra || building.nombre} (${buildingId})`);
      console.log(`   📂 Ruta de pisos: ${pisosPath}`);

      if (!fs.existsSync(pisosPath)) {
        console.log(`   ⚠️  Carpeta de pisos no existe, creando...`);
        fs.mkdirSync(pisosPath, { recursive: true });
      }

      // Listar archivos en la carpeta de pisos
      const files = fs.readdirSync(pisosPath);
      const imageFiles = files.filter(file => 
        file.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i)
      );

      console.log(`   📸 Imágenes encontradas: ${imageFiles.length}`);
      imageFiles.forEach(file => console.log(`     - ${file}`));

      // Procesar cada nivel
      for (const nivel of building.niveles) {
        const nivelNumber = nivel.numero;
        const nivelPath = path.join(pisosPath, nivelNumber.toString());
        const targetImagePath = path.join(nivelPath, 'piso.jpg');

        console.log(`\n   🔧 Procesando nivel ${nivelNumber}:`);

        // Crear carpeta del nivel si no existe
        if (!fs.existsSync(nivelPath)) {
          console.log(`     📁 Creando carpeta: ${nivelPath}`);
          fs.mkdirSync(nivelPath, { recursive: true });
        }

        // Verificar si ya existe piso.jpg
        if (fs.existsSync(targetImagePath)) {
          console.log(`     ✅ Ya existe piso.jpg para nivel ${nivelNumber}`);
          continue;
        }

        // Buscar imagen correspondiente a este nivel
        const possibleNames = [
          `piso-${nivelNumber}-*.jpg`,
          `piso-${nivelNumber}.*`,
          `nivel-${nivelNumber}.*`,
          `floor-${nivelNumber}.*`,
          `${nivelNumber}.*`
        ];

        let sourceImage = null;
        
        // Buscar imagen que coincida con el patrón
        for (const file of imageFiles) {
          if (file.includes(`piso-${nivelNumber}`) || 
              file.includes(`nivel-${nivelNumber}`) ||
              file.includes(`floor-${nivelNumber}`)) {
            sourceImage = file;
            break;
          }
        }

        if (sourceImage) {
          const sourcePath = path.join(pisosPath, sourceImage);
          console.log(`     📋 Imagen encontrada: ${sourceImage}`);
          console.log(`     🔄 Moviendo a: ${targetImagePath}`);
          
          // Copiar (no mover) para mantener el original
          fs.copyFileSync(sourcePath, targetImagePath);
          console.log(`     ✅ Imagen copiada exitosamente`);
        } else {
          console.log(`     ❌ No se encontró imagen para nivel ${nivelNumber}`);
          
          // Si hay imágenes disponibles pero no específicas, usar la primera como placeholder
          if (imageFiles.length > 0) {
            const firstImage = imageFiles[0];
            const sourcePath = path.join(pisosPath, firstImage);
            console.log(`     🔄 Usando imagen por defecto: ${firstImage}`);
            fs.copyFileSync(sourcePath, targetImagePath);
            console.log(`     ✅ Imagen por defecto asignada`);
          }
        }
      }

      console.log(`\n   📊 Resumen para edificio ${building.letra}:`);
      console.log(`     - Niveles procesados: ${building.niveles.length}`);
      console.log(`     - Imágenes disponibles: ${imageFiles.length}`);
    }

    console.log('\n🎉 Organización de imágenes de pisos completada!');

  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

organizeFloorImages();
