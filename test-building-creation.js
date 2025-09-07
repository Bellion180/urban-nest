// Test para crear un edificio via API
const fetch = require('node-fetch');
const FormData = require('form-data');

async function testBuildingCreation() {
  try {
    // Primero hacer login para obtener token
    console.log('🔐 Haciendo login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso:', loginData.user.email);

    // Crear FormData para el edificio
    const formData = new FormData();
    formData.append('name', 'Edificio de Prueba');
    formData.append('description', 'Este es un edificio de prueba creado via API');
    formData.append('floors', JSON.stringify([
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
    ]));

    console.log('🏗️ Creando edificio...');
    const buildingResponse = await fetch('http://localhost:3001/api/buildings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
      },
      body: formData,
    });

    console.log('📊 Status:', buildingResponse.status);
    console.log('📊 Status Text:', buildingResponse.statusText);

    if (!buildingResponse.ok) {
      const errorText = await buildingResponse.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Building creation failed: ${buildingResponse.status}`);
    }

    const buildingData = await buildingResponse.json();
    console.log('✅ Edificio creado exitosamente:', buildingData);

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testBuildingCreation();
