const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testFrontendAPI() {
  console.log('🧪 Probando API tal como la usa el frontend...\n');

  try {
    // 1. Login
    console.log('🔐 Login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('✅ Token obtenido');

    // 2. Llamada exacta que hace buildingService.getAll() -> /torres
    console.log('\n🏢 Probando /api/torres (buildingService.getAll())...');
    const torresResponse = await fetch(`${API_BASE}/torres`, { headers });
    
    if (torresResponse.ok) {
      const torres = await torresResponse.json();
      console.log(`✅ Torres obtenidas: ${torres.length}`);
      
      // Mostrar estructura completa para debugging
      torres.forEach((torre, index) => {
        console.log(`\n📋 Torre ${index + 1}:`);
        console.log(`   name: "${torre.name}"`);
        console.log(`   id: "${torre.id}"`);
        console.log(`   description: "${torre.description}"`);
        console.log(`   floors (array):`, torre.floors ? 'EXISTS' : 'MISSING');
        
        if (torre.floors) {
          console.log(`   floors.length: ${torre.floors.length}`);
          torre.floors.forEach((floor, floorIndex) => {
            console.log(`     Floor ${floorIndex + 1}:`);
            console.log(`       id: "${floor.id}"`);
            console.log(`       name: "${floor.name}"`);
            console.log(`       number: ${floor.number}`);
            console.log(`       apartments: [${floor.apartments?.join(', ') || 'none'}]`);
            console.log(`       _count.residents: ${floor._count?.residents || 0}`);
          });
        } else {
          console.log('     ❌ NO FLOORS ARRAY');
        }
        
        console.log(`   _count.residents: ${torre._count?.residents || 0}`);
        console.log(`   totalResidents: ${torre.totalResidents || 'undefined'}`);
      });

      // 3. Probar también /buildings (compatibilidad)
      console.log('\n🏢 Probando /api/buildings (compatibilidad)...');
      const buildingsResponse = await fetch(`${API_BASE}/buildings`, { headers });
      
      if (buildingsResponse.ok) {
        const buildings = await buildingsResponse.json();
        console.log(`✅ Buildings obtenidos: ${buildings.length}`);
        console.log('   Primer building tiene floors:', buildings[0]?.floors ? 'SÍ' : 'NO');
      } else {
        console.log('❌ Error en /api/buildings');
      }

    } else {
      console.log('❌ Error obteniendo torres');
      const errorText = await torresResponse.text();
      console.log('Error:', errorText);
    }

    console.log('\n🎉 Pruebas completadas!');
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error.message);
  }
}

testFrontendAPI();
