// Script para probar el nuevo endpoint de companeros por edificio y nivel
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function testCompanerosFloorEndpoint() {
  console.log('🔍 Probando nuevo endpoint de companeros por nivel...\n');

  try {
    // 1. Hacer login
    console.log('1️⃣ Haciendo login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso');

    // 2. Obtener torres
    console.log('\n2️⃣ Obteniendo torres...');
    const torresResponse = await fetch(`${API_BASE_URL}/torres`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!torresResponse.ok) {
      throw new Error(`Torres request failed: ${torresResponse.status}`);
    }

    const torres = await torresResponse.json();
    console.log('✅ Torres obtenidas:', torres.length);
    
    if (torres.length === 0) {
      throw new Error('No hay torres en la base de datos');
    }

    const torreA = torres.find(t => t.name === 'A');
    if (!torreA) {
      console.log('❌ Torre A no encontrada, usando primera torre disponible');
      const firstTorre = torres[0];
      console.log(`📋 Usando Torre: ${firstTorre.name} (ID: ${firstTorre.id})`);
      
      // Probar con la primera torre disponible
      await testFloorEndpoint(token, firstTorre.id, firstTorre.name);
    } else {
      console.log(`📋 Torre A encontrada (ID: ${torreA.id})`);
      await testFloorEndpoint(token, torreA.id, 'A');
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

async function testFloorEndpoint(token, torreId, torreLetra) {
  // 3. Probar endpoint de companeros por nivel
  console.log(`\n3️⃣ Probando residentes del nivel 1 en Torre ${torreLetra}...`);
  const url1 = `${API_BASE_URL}/companeros/building/${torreId}/floor/1`;
  console.log(`📡 URL: ${url1}`);
  
  const floor1Response = await fetch(url1, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log(`📋 Status: ${floor1Response.status}`);
  
  if (!floor1Response.ok) {
    const errorText = await floor1Response.text();
    console.log(`❌ Error Response: ${errorText}`);
    throw new Error(`Floor 1 request failed: ${floor1Response.status}`);
  }

  const floor1Residents = await floor1Response.json();
  console.log(`✅ Residentes nivel 1: ${floor1Residents.length}`);
  
  if (floor1Residents.length > 0) {
    floor1Residents.forEach(resident => {
      console.log(`  👤 ${resident.nombre} ${resident.apellido} - Depto ${resident.apartamento || 'N/A'} - Piso ${resident.piso || 'N/A'}`);
    });
  } else {
    console.log('  📭 No hay residentes en el nivel 1');
  }

  // 4. Probar nivel 2
  console.log(`\n4️⃣ Probando residentes del nivel 2 en Torre ${torreLetra}...`);
  const url2 = `${API_BASE_URL}/companeros/building/${torreId}/floor/2`;
  console.log(`📡 URL: ${url2}`);
  
  const floor2Response = await fetch(url2, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log(`📋 Status: ${floor2Response.status}`);
  
  if (floor2Response.ok) {
    const floor2Residents = await floor2Response.json();
    console.log(`✅ Residentes nivel 2: ${floor2Residents.length}`);
    
    if (floor2Residents.length > 0) {
      floor2Residents.forEach(resident => {
        console.log(`  👤 ${resident.nombre} ${resident.apellido} - Depto ${resident.apartamento || 'N/A'} - Piso ${resident.piso || 'N/A'}`);
      });
    } else {
      console.log('  📭 No hay residentes en el nivel 2');
    }
  } else {
    const errorText = await floor2Response.text();
    console.log(`❌ Error en nivel 2: ${errorText}`);
  }

  console.log('\n🎉 Pruebas del endpoint completadas!');
}

testCompanerosFloorEndpoint();
