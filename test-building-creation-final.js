// Test para verificar que la creación de edificios funciona correctamente
import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

async function testBuildingCreation() {
  try {
    console.log('🧪 Probando la creación de edificios...\n');

    // 1. Login first
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
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso');
    const token = loginData.token;

    // 2. Test building creation with FormData
    console.log('\n2️⃣ Creando edificio de prueba...');
    
    const formData = new FormData();
    formData.append('nombre', 'Edificio Test');
    formData.append('descripcion', 'Edificio de prueba automatizada');
    formData.append('floorsData', JSON.stringify([
      {
        id: 'floor-1',
        name: 'Piso 1',
        number: 1
      },
      {
        id: 'floor-2', 
        name: 'Piso 2',
        number: 2
      }
    ]));

    // Create a test image if doesn't exist
    const testImagePath = path.join(process.cwd(), 'test-image.txt');
    if (!fs.existsSync(testImagePath)) {
      fs.writeFileSync(testImagePath, 'test image content');
    }
    
    formData.append('image', fs.createReadStream(testImagePath));

    const buildingResponse = await fetch('http://localhost:3001/api/buildings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const responseText = await buildingResponse.text();
    console.log('📝 Respuesta del servidor:', responseText);

    if (!buildingResponse.ok) {
      throw new Error(`Building creation failed: ${buildingResponse.status} - ${responseText}`);
    }

    const buildingData = JSON.parse(responseText);
    console.log('✅ Edificio creado exitosamente:', buildingData);

    // 3. Test getting buildings
    console.log('\n3️⃣ Obteniendo lista de edificios...');
    const getBuildingsResponse = await fetch('http://localhost:3001/api/buildings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!getBuildingsResponse.ok) {
      throw new Error(`Get buildings failed: ${getBuildingsResponse.status}`);
    }

    const buildings = await getBuildingsResponse.json();
    console.log('✅ Edificios obtenidos:', buildings.length);

    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.error('Stack:', error.stack);
  }
}

testBuildingCreation();
