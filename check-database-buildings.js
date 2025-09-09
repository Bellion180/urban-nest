import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBuildingImages() {
  try {
    console.log('🔍 Consultando base de datos de torres...');
    
    const torres = await prisma.torres.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total de torres en BD: ${torres.length}`);
    console.log('\n📋 Detalle de torres:');
    
    torres.forEach((torre, index) => {
      console.log(`${index + 1}. Torre "${torre.letra}" (ID: ${torre.id_torre})`);
      console.log(`   Descripción: ${torre.descripcion || 'Sin descripción'}`);
      console.log(`   Imagen: ${torre.imagen || '❌ Sin imagen'}`);
      console.log(`   Creada: ${torre.createdAt}`);
      console.log('');
    });

    // Buscar torres sin imagen
    const torresSinImagen = torres.filter(torre => !torre.imagen);
    console.log(`⚠️  Torres sin imagen: ${torresSinImagen.length}`);
    
    if (torresSinImagen.length > 0) {
      console.log('Torres que necesitan imagen:');
      torresSinImagen.forEach(torre => {
        console.log(`  - ${torre.letra} (ID: ${torre.id_torre})`);
      });
    }

    // Buscar torres con imagen
    const torresConImagen = torres.filter(torre => torre.imagen);
    console.log(`✅ Torres con imagen: ${torresConImagen.length}`);
    
    if (torresConImagen.length > 0) {
      console.log('Torres con imagen configurada:');
      torresConImagen.forEach(torre => {
        console.log(`  - ${torre.letra}: ${torre.imagen}`);
      });
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Error consultando base de datos:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkBuildingImages();
