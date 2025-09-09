const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testCompleteBuilding() {
  console.log('🏗️ Probando creación completa de edificio con imágenes...\n');
  
  try {
    // Verificar que tenemos imágenes de referencia
    const referenceImagePath = path.join(__dirname, 'public', 'edificios', 'cmfbw9xex0000fafgj0jteq0y', 'edificio.jpg');
    
    if (!fs.existsSync(referenceImagePath)) {
      console.error('❌ No se encontró imagen de referencia en:', referenceImagePath);
      return;
    }
    
    console.log('✅ Imagen de referencia encontrada:', referenceImagePath);
    
    // Crear FormData con los datos del edificio
    const formData = new FormData();
    formData.append('name', 'Torre Test Completa');
    formData.append('description', 'Edificio de prueba con todas las funcionalidades de imágenes');
    formData.append('address', 'Calle de Prueba 456');
    formData.append('city', 'Ciudad Test');
    formData.append('estado', 'Estado Test');
    formData.append('codigoPostal', '54321');
    formData.append('telefono', '555-0456');
    formData.append('email', 'test@torrecompleta.com');
    
    // Crear estructura de pisos
    const floors = [
      { name: 'Planta Baja', number: 1, apartments: ['101', '102', '103'] },
      { name: 'Primer Piso', number: 2, apartments: ['201', '202', '203'] }
    ];
    
    formData.append('floors', JSON.stringify(floors));
    
    // Agregar imagen principal del edificio
    const imageStream = fs.createReadStream(referenceImagePath);
    formData.append('imagen', imageStream);
    
    console.log('📤 Enviando petición de creación de edificio...');
    
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('http://localhost:3001/api/buildings', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const responseText = await response.text();
    console.log('📥 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('Body:', responseText);
    
    if (!response.ok) {
      console.error('❌ Error al crear edificio:', responseText);
      return;
    }
    
    const buildingData = JSON.parse(responseText);
    const buildingId = buildingData.building?.id || buildingData.id;
    
    if (!buildingId) {
      console.error('❌ No se recibió ID de edificio válido');
      return;
    }
    
    console.log('✅ Edificio creado exitosamente!');
    console.log('📋 ID del edificio:', buildingId);
    console.log('🖼️ Imagen principal:', buildingData.building?.imagen || buildingData.imagen);
    
    // Ahora subir imágenes de pisos
    console.log('\n🏗️ Subiendo imágenes de pisos...');
    
    for (let i = 1; i <= floors.length; i++) {
      console.log(`\n📸 Subiendo imagen para piso ${i}:`);
      
      try {
        const floorFormData = new FormData();
        const floorImageStream = fs.createReadStream(referenceImagePath);
        floorFormData.append('image', floorImageStream);
        
        const floorResponse = await fetch(`http://localhost:3001/api/buildings/${buildingId}/pisos/${i}/image`, {
          method: 'POST',
          body: floorFormData,
          headers: floorFormData.getHeaders()
        });
        
        const floorResponseText = await floorResponse.text();
        console.log(`   Status: ${floorResponse.status}`);
        console.log(`   Response: ${floorResponseText}`);
        
        if (floorResponse.ok) {
          console.log(`   ✅ Imagen de piso ${i} subida correctamente`);
        } else {
          console.log(`   ❌ Error subiendo imagen de piso ${i}`);
        }
        
      } catch (floorError) {
        console.error(`   💥 Error en piso ${i}:`, floorError.message);
      }
    }
    
    // Verificar que el edificio aparece en la lista
    console.log('\n🔍 Verificando que el edificio aparece en la lista...');
    const listResponse = await fetch('http://localhost:3001/api/buildings');
    
    if (listResponse.ok) {
      const buildings = await listResponse.json();
      const newBuilding = buildings.find(b => b.id === buildingId || b.id_torre === buildingId);
      
      if (newBuilding) {
        console.log('✅ Edificio encontrado en la lista:');
        console.log('   Nombre:', newBuilding.nombre || newBuilding.name);
        console.log('   Imagen:', newBuilding.imagen || newBuilding.image);
        console.log('   ID:', newBuilding.id || newBuilding.id_torre);
      } else {
        console.log('❌ Edificio NO encontrado en la lista');
      }
    } else {
      console.log('❌ Error al obtener lista de edificios');
    }
    
    // Probar carga de imágenes de pisos
    console.log('\n🖼️ Verificando imágenes de pisos...');
    try {
      const floorImagesResponse = await fetch(`http://localhost:3001/api/buildings/${buildingId}/pisos/imagenes`);
      
      if (floorImagesResponse.ok) {
        const floorImagesData = await floorImagesResponse.json();
        console.log('📋 Imágenes de pisos encontradas:');
        console.log(floorImagesData);
      } else {
        console.log('❌ Error al cargar imágenes de pisos');
      }
    } catch (floorImagesError) {
      console.error('💥 Error verificando imágenes de pisos:', floorImagesError.message);
    }
    
    console.log('\n🎉 Prueba completa terminada!');
    console.log(`🌐 Puedes ver el edificio en: http://localhost:8080/building/${buildingId}/niveles`);
    
  } catch (error) {
    console.error('💥 Error en la prueba:', error.message);
  }
}

testCompleteBuilding();
