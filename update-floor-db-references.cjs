// Script para actualizar las referencias de imágenes de pisos en la base de datos
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function updateFloorImageReferences() {
  console.log('🔄 Actualizando referencias de imágenes de pisos en la base de datos...\n');

  try {
    // Obtener todas las torres
    const torres = await prisma.torres.findMany({
      include: {
        niveles: {
          orderBy: { numero: 'asc' }
        }
      }
    });

    for (const torre of torres) {
      console.log(`🏢 Procesando torre: ${torre.nombre} (${torre.id_torre})`);
      
      for (const nivel of torre.niveles) {
        // Verificar si existe la imagen estándar para este piso
        const imagePath = path.join('public', 'edificios', torre.id_torre, 'pisos', nivel.numero.toString(), 'piso.jpg');
        
        if (fs.existsSync(imagePath)) {
          const imageReference = `/edificios/${torre.id_torre}/pisos/${nivel.numero}/piso.jpg`;
          
          // Actualizar la base de datos
          await prisma.niveles.update({
            where: { id_nivel: nivel.id_nivel },
            data: { imagen: imageReference }
          });
          
          console.log(`  ✅ Nivel ${nivel.numero}: Imagen actualizada -> ${imageReference}`);
        } else {
          console.log(`  ❌ Nivel ${nivel.numero}: Sin imagen física encontrada`);
          
          // Limpiar referencia de imagen si no existe el archivo
          await prisma.niveles.update({
            where: { id_nivel: nivel.id_nivel },
            data: { imagen: null }
          });
        }
      }
      
      console.log('');
    }
    
    console.log('🎉 ¡Actualización de referencias completada!');
    
    // Mostrar resumen
    const totalNiveles = await prisma.niveles.count();
    const nivelesConImagen = await prisma.niveles.count({
      where: { imagen: { not: null } }
    });
    
    console.log(`📊 Resumen:`);
    console.log(`   Total de niveles: ${totalNiveles}`);
    console.log(`   Niveles con imagen: ${nivelesConImagen}`);
    console.log(`   Niveles sin imagen: ${totalNiveles - nivelesConImagen}`);
    
  } catch (error) {
    console.error('❌ Error actualizando referencias:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFloorImageReferences();
