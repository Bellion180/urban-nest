import fetch from 'node-fetch';

async function testUpdate() {
  try {
    // Primero hacer login para obtener token
    console.log('1. Haciendo login...');
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
    const token = loginData.token;
    console.log('✅ Login exitoso, token obtenido');

    // Obtener lista de edificios para usar un ID real
    console.log('2. Obteniendo lista de edificios...');
    const buildingsResponse = await fetch('http://localhost:3001/api/buildings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!buildingsResponse.ok) {
      throw new Error(`Failed to get buildings: ${buildingsResponse.status}`);
    }

    const buildings = await buildingsResponse.json();
    console.log('✅ Edificios obtenidos:', buildings.length);

    if (buildings.length === 0) {
      console.log('❌ No hay edificios para probar');
      return;
    }

    const buildingId = buildings[0].id;
    console.log('3. Probando actualización del edificio:', buildingId);

    // Actualizar edificio (volver al endpoint original)
    const updateResponse = await fetch(`http://localhost:3001/api/buildings/${buildingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Building Updated',
        description: 'Test Description Updated'
      })
    });

    console.log('Response status:', updateResponse.status);
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.log('❌ Error response:', errorText);
      throw new Error(`Update failed: ${updateResponse.status}`);
    }

    const updateData = await updateResponse.json();
    console.log('✅ Actualización exitosa:', updateData);

  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
}

testUpdate();
