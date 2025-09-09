// Test simple para reproducir el error 500 exacto
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function testBuildingError500() {
  try {
    console.log('🧪 Reproduciendo el error 500 exacto...');

    // 1. Login para obtener token
    console.log('1️⃣ Obteniendo token...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const token = loginData.token;
    console.log('✅ Token obtenido exitosamente');

    // 2. Crear FormData exactamente como el frontend
    console.log('2️⃣ Creando FormData...');
    const formData = new FormData();
    formData.append('name', 'Edificio Test Error 500');
    formData.append('description', 'Test para reproducir error 500');
    
    // Simular floors data del frontend
    const floorsData = [];
    for (let i = 1; i <= 2; i++) {
      const apartments = [];
      for (let j = 1; j <= 4; j++) {
        apartments.push(`${i}0${j}`);
      }
      floorsData.push({
        name: `Piso ${i}`,
        number: i,
        apartments: apartments
      });
    }
    
    formData.append('floors', JSON.stringify(floorsData));
    console.log('📦 Floors data:', JSON.stringify(floorsData, null, 2));

    // Crear archivo de imagen de prueba si no existe
    const testImagePath = 'test-image.jpg';
    if (!fs.existsSync(testImagePath)) {
      fs.writeFileSync(testImagePath, Buffer.from('fake image data'));
    }
    formData.append('image', fs.createReadStream(testImagePath));

    // 3. Enviar request exactamente como el frontend
    console.log('3️⃣ Enviando request...');
    const buildingResponse = await fetch('http://localhost:3001/api/buildings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('📡 Response status:', buildingResponse.status);
    console.log('📡 Response headers:', Object.fromEntries(buildingResponse.headers.entries()));
    
    const responseText = await buildingResponse.text();
    console.log('📝 Response body:', responseText);

    if (!buildingResponse.ok) {
      console.error('❌ ERROR 500 REPRODUCIDO:');
      console.error('Status:', buildingResponse.status);
      console.error('Body:', responseText);
      
      // Parse the error if it's JSON
      try {
        const errorObj = JSON.parse(responseText);
        console.error('💥 Error details:', errorObj.details || errorObj.error);
      } catch (e) {
        console.error('💥 Raw error:', responseText);
      }
    } else {
      console.log('✅ ¡Request exitoso!');
      const result = JSON.parse(responseText);
      console.log('🏗️ Edificio creado:', result);
    }

    // Limpiar archivo de prueba
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }

  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Esperar 2 segundos para que el servidor esté listo
setTimeout(testBuildingError500, 2000);
