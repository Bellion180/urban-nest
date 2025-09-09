const fetch = require('node-fetch');

async function testSimple() {
  try {
    console.log('🔍 Probando conexión al servidor...');
    
    const response = await fetch('http://localhost:3001/api/health');
    const data = await response.text();
    
    console.log('✅ Respuesta recibida:');
    console.log('Status:', response.status);
    console.log('Data:', data);
    
    if (response.ok) {
      console.log('✅ Servidor funcionando correctamente');
      
      // Ahora probar obtener la lista de edificios
      console.log('\n🏢 Probando obtener lista de edificios...');
      const buildingsResponse = await fetch('http://localhost:3001/api/buildings');
      const buildings = await buildingsResponse.json();
      
      console.log('📋 Edificios encontrados:', buildings.length);
      buildings.forEach(building => {
        console.log(`- ${building.nombre} (${building.id}): ${building.imagen || 'Sin imagen'}`);
      });
    } else {
      console.log('❌ Servidor respondió con error');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testSimple();
