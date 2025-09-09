import fetch from 'node-fetch';

async function testBuildingAPI() {
  const baseUrl = 'http://localhost:3001';
  
  try {
    console.log('🧪 PROBANDO API DE EDIFICIOS\n');

    // 1. Verificar que el servidor está corriendo
    console.log('🔌 Verificando servidor...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Servidor respondiendo correctamente');
    } else {
      throw new Error('Servidor no responde');
    }

    // 2. Login para obtener token
    console.log('\n🔐 Haciendo login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
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
      throw new Error('Error en login');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso, token obtenido');

    // 3. Crear edificio usando FormData (simulando el frontend)
    console.log('\n🏗️ Creando edificio...');
    const formData = new FormData();
    formData.append('name', 'Torre API Test');
    formData.append('letter', 'API-TEST');
    formData.append('description', 'Torre creada via API test');
    formData.append('floors', JSON.stringify([
      {
        name: 'Piso 1',
        number: 1,
        apartments: [
          { name: '101', number: '101', description: 'Departamento 101' },
          { name: '102', number: '102', description: 'Departamento 102' }
        ]
      },
      {
        name: 'Piso 2', 
        number: 2,
        apartments: [
          { name: '201', number: '201', description: 'Departamento 201' }
        ]
      }
    ]));

    const buildingResponse = await fetch(`${baseUrl}/api/buildings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!buildingResponse.ok) {
      const errorText = await buildingResponse.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Error creating building: ${buildingResponse.status} ${buildingResponse.statusText}`);
    }

    const newBuilding = await buildingResponse.json();
    console.log('✅ Edificio creado exitosamente');
    console.log(`   ID: ${newBuilding.id}`);
    console.log(`   Letra: ${newBuilding.letter}`);
    console.log(`   Pisos: ${newBuilding.floors?.length || 0}`);

    // 4. Verificar que el edificio se puede consultar
    console.log('\n🔍 Consultando edificios...');
    const buildingsResponse = await fetch(`${baseUrl}/api/buildings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (buildingsResponse.ok) {
      const buildings = await buildingsResponse.json();
      console.log(`✅ ${buildings.length} edificios encontrados`);
      const testBuilding = buildings.find(b => b.letter === 'API-TEST');
      if (testBuilding) {
        console.log('✅ Edificio de prueba encontrado en la lista');
      }
    }

    // 5. Limpiar (eliminar edificio de prueba)
    console.log('\n🧹 Limpiando edificio de prueba...');
    const deleteResponse = await fetch(`${baseUrl}/api/buildings/${newBuilding.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (deleteResponse.ok) {
      console.log('✅ Edificio de prueba eliminado');
    }

    console.log('\n🎉 ¡TODAS LAS PRUEBAS DE API EXITOSAS!');
    console.log('La creación de edificios via API funciona correctamente');

  } catch (error) {
    console.error('❌ Error en las pruebas de API:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

testBuildingAPI();
