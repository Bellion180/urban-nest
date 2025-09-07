const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testNivelesAPI() {
  console.log('🧪 Probando API de niveles...\n');

  try {
    // 1. Login para obtener token
    console.log('🔐 Obteniendo token...');
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

    // 2. Obtener torres para ver la estructura con niveles
    console.log('\n🏢 Obteniendo torres con niveles...');
    const torresResponse = await fetch(`${API_BASE}/torres`, { headers });
    
    if (torresResponse.ok) {
      const torres = await torresResponse.json();
      console.log(`✅ Torres obtenidas: ${torres.length}`);
      
      torres.forEach((torre, index) => {
        console.log(`\n   Torre ${index + 1}: ${torre.name}`);
        console.log(`   ID: ${torre.id}`);
        console.log(`   Niveles/Pisos: ${torre.floors?.length || 0}`);
        
        if (torre.floors && torre.floors.length > 0) {
          torre.floors.forEach(floor => {
            console.log(`     - Nivel ${floor.number}: ${floor.name} (${floor.apartments?.length || 0} departamentos)`);
          });
        } else {
          console.log('     - Sin niveles definidos');
        }
      });

      // 3. Si hay torres, probar obtener niveles de la primera
      if (torres.length > 0) {
        const primeraTorre = torres[0];
        console.log(`\n📊 Obteniendo niveles específicos de Torre ${primeraTorre.name}...`);
        
        const nivelesResponse = await fetch(`${API_BASE}/niveles/torre/${primeraTorre.id}`, { headers });
        
        if (nivelesResponse.ok) {
          const niveles = await nivelesResponse.json();
          console.log(`✅ Niveles obtenidos directamente: ${niveles.length}`);
          
          niveles.forEach(nivel => {
            console.log(`   - Nivel ${nivel.numero}: ${nivel.nombre}`);
            console.log(`     Departamentos: ${nivel.departamentos?.length || 0}`);
          });
        } else {
          console.log('❌ Error obteniendo niveles directamente');
        }

        // 4. Probar crear un nuevo nivel
        console.log(`\n➕ Creando nivel de prueba en Torre ${primeraTorre.name}...`);
        const nuevoNivelResponse = await fetch(`${API_BASE}/niveles/torre/${primeraTorre.id}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            numero: 99,
            nombre: 'Nivel de Prueba'
          })
        });

        if (nuevoNivelResponse.ok) {
          const nuevoNivel = await nuevoNivelResponse.json();
          console.log(`✅ Nivel creado: ${nuevoNivel.nombre} (ID: ${nuevoNivel.id_nivel})`);
          
          // Eliminar el nivel de prueba
          console.log('🗑️ Eliminando nivel de prueba...');
          const deleteResponse = await fetch(`${API_BASE}/niveles/${nuevoNivel.id_nivel}`, {
            method: 'DELETE',
            headers
          });

          if (deleteResponse.ok) {
            console.log('✅ Nivel de prueba eliminado');
          } else {
            console.log('❌ Error eliminando nivel de prueba');
          }
        } else {
          const errorText = await nuevoNivelResponse.text();
          console.log('❌ Error creando nivel de prueba:', errorText);
        }
      }
    } else {
      console.log('❌ Error obteniendo torres');
    }

    console.log('\n🎉 Pruebas de API de niveles completadas!');
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error.message);
  }
}

testNivelesAPI();
