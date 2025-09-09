const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testBuildingCreation() {
  console.log('🏗️ Iniciando prueba de creación de edificio con imagen...\n');
  
  // Verificar que tenemos una imagen de prueba
  const testImagePath = path.join(__dirname, 'public', 'edificios', 'cmfbw9xex0000fafgj0jteq0y', 'edificio.jpg');
  
  if (!fs.existsSync(testImagePath)) {
    console.error('❌ No se encontró imagen de prueba en:', testImagePath);
    return;
  }
  
  console.log('✅ Imagen de prueba encontrada:', testImagePath);
  
  // Crear FormData con los datos del edificio
  const formData = new FormData();
  formData.append('nombre', 'Torre Test Completa');
  formData.append('descripcion', 'Torre creada para probar la funcionalidad completa de imágenes');
  formData.append('direccion', 'Calle de Prueba 123');
  formData.append('ciudad', 'Ciudad de Prueba');
  formData.append('estado', 'Estado de Prueba');
  formData.append('codigoPostal', '12345');
  formData.append('telefono', '555-0123');
  formData.append('email', 'test@torrecompleta.com');
  
  // Agregar la imagen
  const imageStream = fs.createReadStream(testImagePath);
  formData.append('imagen', imageStream);
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('📤 Enviando petición POST a /api/buildings...');
    
    const response = await fetch('http://localhost:3001/api/buildings', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const responseText = await response.text();
    console.log('📥 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Body:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Edificio creado exitosamente!');
      console.log('📋 Datos del edificio:', data);
      
      if (data.imagen) {
        console.log('🖼️ Imagen configurada:', data.imagen);
        
        // Verificar que la imagen existe físicamente
        const imagePath = path.join(__dirname, 'public', data.imagen);
        if (fs.existsSync(imagePath)) {
          console.log('✅ Archivo de imagen existe en:', imagePath);
        } else {
          console.log('❌ Archivo de imagen NO existe en:', imagePath);
        }
      } else {
        console.log('⚠️ No se configuró imagen en la respuesta');
      }
      
      // Verificar que el edificio aparece en la lista
      console.log('\n🔍 Verificando que el edificio aparece en la lista...');
      const listResponse = await fetch('http://localhost:3001/api/buildings');
      const buildings = await listResponse.json();
      
      const newBuilding = buildings.find(b => b.id === data.id);
      if (newBuilding) {
        console.log('✅ Edificio encontrado en la lista:', newBuilding.nombre);
        console.log('🖼️ Imagen en lista:', newBuilding.imagen);
      } else {
        console.log('❌ Edificio NO encontrado en la lista');
      }
      
    } else {
      console.log('❌ Error al crear edificio');
    }
    
  } catch (error) {
    console.error('💥 Error en la prueba:', error.message);
  }
}

testBuildingCreation();
