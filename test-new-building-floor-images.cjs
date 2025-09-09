// Script de prueba para crear una nueva torre y verificar imágenes de pisos
const fs = require('fs');
const path = require('path');

async function testNewBuildingWithFloorImages() {
  console.log('🧪 Simulando creación de nueva torre con imágenes de pisos...\n');

  // Simular datos de una nueva torre
  const newBuildingId = 'test-' + Date.now();
  const buildingName = 'Torre Test Imagen Pisos';
  const numberOfFloors = 3;

  console.log(`🏢 Nueva torre: ${buildingName}`);
  console.log(`📋 ID: ${newBuildingId}`);
  console.log(`🏗️ Pisos: ${numberOfFloors}\n`);

  // Crear estructura de directorios para la nueva torre
  const buildingDir = path.join('public', 'edificios', newBuildingId);
  if (!fs.existsSync(buildingDir)) {
    fs.mkdirSync(buildingDir, { recursive: true });
    console.log(`✅ Directorio principal creado: ${buildingDir}`);
  }

  // Crear carpetas e imágenes para cada piso
  for (let floor = 1; floor <= numberOfFloors; floor++) {
    const floorDir = path.join(buildingDir, 'pisos', floor.toString());
    
    if (!fs.existsSync(floorDir)) {
      fs.mkdirSync(floorDir, { recursive: true });
      console.log(`📁 Directorio del piso ${floor} creado: ${floorDir}`);
    }

    // Copiar imagen de referencia para este piso
    const sourceImage = path.join('public', 'edificios', 'cmfbw832f0002fa3gt92odart', 'pisos', '1', 'piso.jpg');
    const targetImage = path.join(floorDir, 'piso.jpg');

    if (fs.existsSync(sourceImage)) {
      fs.copyFileSync(sourceImage, targetImage);
      console.log(`🖼️ Imagen copiada para piso ${floor}: ${targetImage}`);
    } else {
      console.log(`❌ No se pudo copiar imagen para piso ${floor} - imagen fuente no encontrada`);
    }
  }

  console.log('\n🎯 Prueba de estructura de archivos completada');
  console.log('\n📊 Resumen:');
  console.log(`   Torre de prueba: ${newBuildingId}`);
  console.log(`   Pisos creados: ${numberOfFloors}`);
  
  // Verificar que los archivos existen
  for (let floor = 1; floor <= numberOfFloors; floor++) {
    const imagePath = path.join(buildingDir, 'pisos', floor.toString(), 'piso.jpg');
    const exists = fs.existsSync(imagePath);
    console.log(`   Piso ${floor}: ${exists ? '✅' : '❌'} ${imagePath}`);
  }

  console.log('\n🌐 URLs de prueba:');
  for (let floor = 1; floor <= numberOfFloors; floor++) {
    console.log(`   Piso ${floor}: http://localhost:3001/edificios/${newBuildingId}/pisos/${floor}/piso.jpg`);
  }

  console.log('\n✅ ¡Prueba completada! Ahora puedes probar creando una torre real en el frontend.');
}

testNewBuildingWithFloorImages();
