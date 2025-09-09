const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data)
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testBuildingAPI() {
  const baseUrl = 'http://localhost:3001';
  
  try {
    console.log('🧪 PROBANDO API DE EDIFICIOS\n');

    // 1. Verificar que el servidor está corriendo
    console.log('🔌 Verificando servidor...');
    const healthResponse = await makeRequest(`${baseUrl}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Servidor respondiendo correctamente');
    } else {
      throw new Error('Servidor no responde');
    }

    // 2. Login para obtener token
    console.log('\n🔐 Haciendo login...');
    const loginResponse = await makeRequest(`${baseUrl}/api/auth/login`, {
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
      console.error('Error en login:', errorText);
      throw new Error('Error en login');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso, token obtenido');

    // 3. Crear edificio (sin imagen para simplificar)
    console.log('\n🏗️ Creando edificio...');
    const buildingData = {
      name: 'Torre API Test',
      letter: 'API-TEST',
      description: 'Torre creada via API test',
      floors: [
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
      ]
    };

    const buildingResponse = await makeRequest(`${baseUrl}/api/buildings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buildingData)
    });

    if (!buildingResponse.ok) {
      const errorText = await buildingResponse.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Error creating building: ${buildingResponse.status}`);
    }

    const newBuilding = await buildingResponse.json();
    console.log('✅ Edificio creado exitosamente');
    console.log(`   ID: ${newBuilding.id}`);
    console.log(`   Letra: ${newBuilding.letter}`);
    console.log(`   Nombre: ${newBuilding.name}`);

    // 4. Verificar que el edificio se puede consultar
    console.log('\n🔍 Consultando edificios...');
    const buildingsResponse = await makeRequest(`${baseUrl}/api/buildings`, {
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
    const deleteResponse = await makeRequest(`${baseUrl}/api/buildings/${newBuilding.id}`, {
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
    console.error('Stack:', error.stack);
  }
}

testBuildingAPI();
