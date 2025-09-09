import fs from 'fs';
import path from 'path';

console.log('🔄 Organizando imágenes de edificios...');

// Directorio base de edificios
const edificiosDir = path.join('public', 'edificios');

if (!fs.existsSync(edificiosDir)) {
  console.log('❌ Directorio de edificios no existe');
  process.exit(1);
}

// Leer contenido del directorio
const items = fs.readdirSync(edificiosDir);
console.log('📋 Items encontrados en /public/edificios/:', items.length);

// Separar archivos sueltos de carpetas
const archivos = items.filter(item => {
  const itemPath = path.join(edificiosDir, item);
  return fs.statSync(itemPath).isFile();
});

const carpetas = items.filter(item => {
  const itemPath = path.join(edificiosDir, item);
  return fs.statSync(itemPath).isDirectory();
});

console.log('📄 Archivos sueltos:', archivos.length);
console.log('📁 Carpetas de edificios:', carpetas.length);

// Mostrar archivos sueltos
console.log('\n📄 Archivos que necesitan ser organizados:');
archivos.forEach(archivo => {
  const extension = path.extname(archivo).toLowerCase();
  const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension);
  console.log(`  ${isImage ? '🖼️' : '📄'} ${archivo}`);
});

// Mostrar carpetas existentes
console.log('\n📁 Carpetas de edificios existentes:');
carpetas.forEach(carpeta => {
  const carpetaPath = path.join(edificiosDir, carpeta);
  const contenido = fs.readdirSync(carpetaPath);
  console.log(`  📁 ${carpeta}/`);
  contenido.forEach(archivo => {
    console.log(`    📄 ${archivo}`);
  });
});

// Instrucciones para limpiar manualmente
console.log('\n🔧 Para organizar manualmente:');
console.log('1. Los archivos sueltos necesitan ser movidos a carpetas de edificio específicas');
console.log('2. Las carpetas de edificios deberían contener solo imágenes de ese edificio específico');
console.log('3. El archivo "image-1757376060873-181390284.jpg" parece ser el de "Torre Naty" que funciona');

// Sugerir automatización
const imagenesNoOrganizadas = archivos.filter(archivo => {
  const extension = path.extname(archivo).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension);
});

if (imagenesNoOrganizadas.length > 0) {
  console.log(`\n⚠️  Hay ${imagenesNoOrganizadas.length} imágenes no organizadas que pueden estar causando problemas`);
  console.log('💡 Considerar crear un script para asociar estas imágenes con edificios específicos');
}
