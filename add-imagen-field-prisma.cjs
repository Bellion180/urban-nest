// Script para agregar campo imagen usando Prisma SQL crudo
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function addImageFieldAndUpdateReferences() {
  console.log('🔄 Agregando campo imagen y actualizando referencias...\n');

  try {
    // Primero intentar agregar el campo imagen usando SQL crudo
    try {
      await prisma.$executeRaw`ALTER TABLE niveles ADD COLUMN imagen VARCHAR(255) NULL`;
      console.log('✅ Campo "imagen" agregado a la tabla niveles');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('✅ Campo "imagen" ya existe en la tabla niveles');
      } else {
        console.error('❌ Error agregando campo:', error.message);
        // Continuar anyway, el campo podría existir
      }
    }

    // Obtener todas las torres y niveles usando raw SQL
    const torres = await prisma.$queryRaw`SELECT id_torre, letra FROM torres`;
    
    for (const torre of torres) {
      console.log(`🏢 Procesando torre: ${torre.letra} (${torre.id_torre})`);
      
      // Obtener niveles de esta torre
      const niveles = await prisma.$queryRaw`
        SELECT id_nivel, nombre, numero 
        FROM niveles 
        WHERE id_torre = ${torre.id_torre}
      `;
      
      for (const nivel of niveles) {
        // Verificar si existe la imagen física
        const imagePath = path.join('public', 'edificios', torre.id_torre, 'pisos', nivel.numero.toString(), 'piso.jpg');
        
        if (fs.existsSync(imagePath)) {
          const imageReference = `/edificios/${torre.id_torre}/pisos/${nivel.numero}/piso.jpg`;
          
          // Actualizar la base de datos usando SQL crudo
          await prisma.$executeRaw`
            UPDATE niveles 
            SET imagen = ${imageReference} 
            WHERE id_nivel = ${nivel.id_nivel}
          `;
          
          console.log(`  ✅ Nivel ${nivel.numero}: Imagen actualizada -> ${imageReference}`);
        } else {
          console.log(`  ❌ Nivel ${nivel.numero}: Sin imagen física encontrada`);
          
          // Limpiar referencia si no existe el archivo
          await prisma.$executeRaw`
            UPDATE niveles 
            SET imagen = NULL 
            WHERE id_nivel = ${nivel.id_nivel}
          `;
        }
      }
      
      console.log('');
    }
    
    // Mostrar resumen usando raw SQL
    const totalResult = await prisma.$queryRaw`SELECT COUNT(*) as total FROM niveles`;
    const conImagenResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM niveles WHERE imagen IS NOT NULL`;
    
    const total = Number(totalResult[0].total);
    const conImagen = Number(conImagenResult[0].count);
    
    console.log('🎉 ¡Actualización completada!');
    console.log(`📊 Resumen:`);
    console.log(`   Total de niveles: ${total}`);
    console.log(`   Niveles con imagen: ${conImagen}`);
    console.log(`   Niveles sin imagen: ${total - conImagen}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addImageFieldAndUpdateReferences();
