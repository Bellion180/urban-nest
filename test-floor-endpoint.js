import fetch from 'node-fetch';

async function testFloorResidentsEndpoint() {
  try {
    console.log('🧪 Probando endpoint /api/residents/by-floor...');
    
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
      throw new Error(`Login falló: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso');
    
    const token = loginData.token;
    
    // Primero probar la ruta base de residents
    console.log('2. Probando ruta base /api/residents...');
    const baseResidentsResponse = await fetch('http://localhost:3001/api/residents', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📋 Status ruta base: ${baseResidentsResponse.status}`);
    if (!baseResidentsResponse.ok) {
      const errorText = await baseResidentsResponse.text();
      console.log(`❌ Error en ruta base: ${errorText}`);
    } else {
      const baseResidents = await baseResidentsResponse.json();
      console.log(`✅ Ruta base funciona, residentes: ${baseResidents.length}`);
    }
    
    // Obtener edificios disponibles
    console.log('3. Obteniendo edificios...');
    const buildingsResponse = await fetch('http://localhost:3001/api/buildings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!buildingsResponse.ok) {
      throw new Error(`Error obteniendo edificios: ${buildingsResponse.status}`);
    }
    
    const buildings = await buildingsResponse.json();
    console.log(`✅ Edificios obtenidos: ${buildings.length}`);
    
    if (buildings.length === 0) {
      console.log('⚠️ No hay edificios disponibles');
      return;
    }
    
    const building = buildings[0];
    console.log(`📍 Usando edificio: ${building.name} (ID: ${building.id})`);
    
    if (!building.floors || building.floors.length === 0) {
      console.log('⚠️ El edificio no tiene pisos');
      return;
    }
    
    const floor = building.floors[0];
    console.log(`📊 Usando piso: ${floor.number}`);
    
    // Probar primero una ruta de test simple
    console.log('4. Probando ruta de test independiente...');
    const testResponse2 = await fetch('http://localhost:3001/api/floor-test/floor-test', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📋 Status floor-test: ${testResponse2.status}`);
    if (testResponse2.ok) {
      const testData2 = await testResponse2.json();
      console.log(`✅ Floor-test funciona: ${testData2.message}`);
    } else {
      console.log('❌ Floor-test falló');
    }
    
    // Probar primero una ruta de test simple
    console.log('5. Probando ruta de test...');
    const testResponse = await fetch('http://localhost:3001/api/residents/test-route', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📋 Status test route: ${testResponse.status}`);
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log(`✅ Test route funciona: ${testData.message}`);
    } else {
      console.log('❌ Test route falló');
    }
    
    // Probar el endpoint de residentes por piso
    console.log('6. Probando endpoint by-floor...');
    const url = `http://localhost:3001/api/residents/by-floor/${building.id}/${floor.number}`;
    console.log(`📡 URL: ${url}`);
    
    const residentsResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📋 Status: ${residentsResponse.status}`);
    console.log(`📋 Status Text: ${residentsResponse.statusText}`);
    
    if (!residentsResponse.ok) {
      const errorText = await residentsResponse.text();
      console.log(`❌ Error Response: ${errorText}`);
      throw new Error(`Error: ${residentsResponse.status} - ${residentsResponse.statusText}`);
    }
    
    const residents = await residentsResponse.json();
    console.log(`✅ Residentes obtenidos: ${residents.length}`);
    
    if (residents.length > 0) {
      console.log('👥 Primer residente:', {
        nombre: residents[0].nombre,
        apellido: residents[0].apellido,
        apartamento: residents[0].apartamento
      });
    }
    
  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    console.error(error);
  }
}

testFloorResidentsEndpoint();
