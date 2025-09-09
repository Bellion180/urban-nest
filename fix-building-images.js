import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function organizarImagenesEdificios() {
  try {
    console.log('🔄 Organizando imágenes de edificios...');
    
    // Obtener torres con imagen
    const torresConImagen = await prisma.torres.findMany({
      where: {
        imagen: {
          not: null
        }
      }
    });

    console.log(`📊 Procesando ${torresConImagen.length} torres con imagen...`);

    for (const torre of torresConImagen) {
      console.log(`\n🏗️ Procesando Torre "${torre.letra}" (ID: ${torre.id_torre})`);
      console.log(`   Imagen actual: ${torre.imagen}`);

      // Verificar si la imagen está en el formato incorrecto (/edificios/image-xxx.jpg)
      if (torre.imagen.startsWith('/edificios/image-') && !torre.imagen.includes(`/edificios/${torre.id_torre}/`)) {
        
        // Extraer nombre del archivo
        const nombreArchivo = path.basename(torre.imagen);
        const rutaActual = path.join('public', 'edificios', nombreArchivo);
        
        console.log(`   📄 Nombre archivo: ${nombreArchivo}`);
        console.log(`   📁 Ruta actual: ${rutaActual}`);

        // Verificar que el archivo existe en la ubicación actual
        if (fs.existsSync(rutaActual)) {
          console.log(`   ✅ Archivo encontrado`);

          // Crear directorio del edificio si no existe
          const directorioEdificio = path.join('public', 'edificios', torre.id_torre);
          if (!fs.existsSync(directorioEdificio)) {
            fs.mkdirSync(directorioEdificio, { recursive: true });
            console.log(`   📁 Directorio creado: ${directorioEdificio}`);
          }

          // Generar nuevo nombre y ruta
          const extension = path.extname(nombreArchivo);
          const nuevoNombre = `edificio${extension}`;
          const nuevaRuta = path.join(directorioEdificio, nuevoNombre);
          const nuevaImagenPath = `/edificios/${torre.id_torre}/${nuevoNombre}`;

          console.log(`   🔄 Moviendo archivo:`);
          console.log(`      Desde: ${rutaActual}`);
          console.log(`      Hacia: ${nuevaRuta}`);

          try {
            // Mover archivo
            fs.renameSync(rutaActual, nuevaRuta);
            console.log(`   ✅ Archivo movido exitosamente`);

            // Actualizar base de datos
            await prisma.torres.update({
              where: { id_torre: torre.id_torre },
              data: { imagen: nuevaImagenPath }
            });

            console.log(`   ✅ Base de datos actualizada: ${nuevaImagenPath}`);

          } catch (error) {
            console.error(`   ❌ Error moviendo archivo:`, error.message);
          }

        } else {
          console.log(`   ❌ Archivo no encontrado en: ${rutaActual}`);
          
          // Verificar si ya está en la ubicación correcta
          const directorioEdificio = path.join('public', 'edificios', torre.id_torre);
          if (fs.existsSync(directorioEdificio)) {
            const archivos = fs.readdirSync(directorioEdificio);
            const imagenes = archivos.filter(archivo => 
              ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(archivo).toLowerCase())
            );
            
            if (imagenes.length > 0) {
              console.log(`   🔍 Imágenes en directorio edificio:`, imagenes);
              const primeraImagen = imagenes[0];
              const nuevaImagenPath = `/edificios/${torre.id_torre}/${primeraImagen}`;
              
              // Actualizar base de datos con la imagen correcta
              await prisma.torres.update({
                where: { id_torre: torre.id_torre },
                data: { imagen: nuevaImagenPath }
              });
              
              console.log(`   ✅ BD actualizada con imagen existente: ${nuevaImagenPath}`);
            }
          }
        }
      } else {
        console.log(`   ✅ Imagen ya está en formato correcto`);
      }
    }

    console.log('\n🎉 Proceso completado!');
    
    // Mostrar estado final
    console.log('\n📊 Estado final:');
    const torresActualizadas = await prisma.torres.findMany({
      where: {
        imagen: {
          not: null
        }
      }
    });
    
    torresActualizadas.forEach(torre => {
      console.log(`   ${torre.letra}: ${torre.imagen}`);
    });

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Error en organización:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

organizarImagenesEdificios();
