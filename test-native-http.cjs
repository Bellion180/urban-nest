const http = require('http');

function testConnection() {
  console.log('🔍 Probando conexión con http nativo...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('✅ Conexión exitosa!');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📋 Respuesta:', data);
      
      // Ahora probar obtener edificios
      console.log('\n🏢 Probando obtener edificios...');
      testBuildings();
    });
  });

  req.on('error', (err) => {
    console.error('💥 Error de conexión:', err.message);
  });

  req.setTimeout(5000, () => {
    console.error('⏰ Timeout de conexión');
    req.destroy();
  });

  req.end();
}

function testBuildings() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/buildings',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('✅ Obtención de edificios exitosa!');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const buildings = JSON.parse(data);
        console.log(`📋 Edificios encontrados: ${buildings.length}`);
        buildings.forEach(building => {
          console.log(`- ${building.nombre} (ID: ${building.id})`);
          console.log(`  Imagen: ${building.imagen || 'Sin imagen'}`);
        });
      } catch (error) {
        console.error('❌ Error al parsear respuesta:', error.message);
        console.log('Raw data:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('💥 Error al obtener edificios:', err.message);
  });

  req.end();
}

testConnection();
