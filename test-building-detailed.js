// Test para simular exactamente la creación de edificios desde el frontend
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function testBuildingCreationDetailed() {
  try {
    console.log('🧪 Test detallado de creación de edificios...\n');

    // 1. Login
    console.log('1️⃣ Haciendo login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(`Login failed: ${loginResponse.status} - ${errorText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso, token obtenido');
    const token = loginData.token;

    // 2. Crear FormData exactamente como lo hace el frontend
    console.log('\n2️⃣ Preparando datos del edificio...');
    
    const buildingData = {
      name: 'Edificio Test API',
      description: 'Edificio creado para probar la API',
      floors: [
        {
          name: 'Piso 1',
          number: 1,
          apartments: ['101', '102', '103', '104']
        },
        {
          name: 'Piso 2', 
          number: 2,
          apartments: ['201', '202', '203', '204']
        }
      ]
    };

    const formData = new FormData();
    formData.append('name', buildingData.name);
    formData.append('description', buildingData.description);
    formData.append('floors', JSON.stringify(buildingData.floors));

    // Crear imagen de prueba
    const testImageContent = Buffer.from('test image data for building');
    formData.append('image', testImageContent, {
      filename: 'test-building.jpg',
      contentType: 'image/jpeg'
    });

    console.log('📦 FormData preparado:');
    console.log('- name:', buildingData.name);
    console.log('- description:', buildingData.description);
    console.log('- floors:', buildingData.floors.length, 'pisos');
    console.log('- image: test image attached');

    // 3. Enviar petición
    console.log('\n3️⃣ Enviando petición al servidor...');
    
    const buildingResponse = await fetch('http://localhost:3001/api/buildings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('📡 Status de respuesta:', buildingResponse.status);
    console.log('📡 Status text:', buildingResponse.statusText);
    
    const responseText = await buildingResponse.text();
    console.log('📝 Respuesta del servidor (raw):', responseText);

    if (!buildingResponse.ok) {
      console.error('❌ Error en la petición');
      console.error('Status:', buildingResponse.status);
      console.error('Response:', responseText);
      throw new Error(`Building creation failed: ${buildingResponse.status} - ${responseText}`);
    }

    const buildingResult = JSON.parse(responseText);
    console.log('✅ Edificio creado exitosamente:');
    console.log('- ID:', buildingResult.building.id);
    console.log('- Nombre:', buildingResult.building.name);
    console.log('- Pisos:', buildingResult.building.floors.length);
    console.log('- Apartamentos totales:', buildingResult.building.totalApartments);

    console.log('\n🎉 ¡Test completado exitosamente!');

  } catch (error) {
    console.error('\n❌ Error en el test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Esperar 2 segundos para que el servidor esté listo
setTimeout(() => {
  testBuildingCreationDetailed();
}, 2000);
