// Test del endpoint para obtener una torre específica
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testTorreById() {
  try {
    console.log('🧪 Probando endpoint GET /api/torres/:id...');
    
    // Primero hacer login para obtener token
    console.log('🔐 Haciendo login...');
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
    console.log('✅ Login exitoso');

    // Obtener todas las torres para tener un ID válido
    console.log('\n📋 Obteniendo lista de torres...');
    const allTorresResponse = await fetch('http://localhost:3001/api/torres', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!allTorresResponse.ok) {
      throw new Error(`Failed to get torres: ${allTorresResponse.status}`);
    }

    const allTorres = await allTorresResponse.json();
    console.log(`✅ Torres encontradas: ${allTorres.length}`);

    if (allTorres.length === 0) {
      console.log('❌ No hay torres para probar');
      return;
    }

    // Probar el endpoint para la primera torre
    const firstTorre = allTorres[0];
    console.log(`\n🏢 Probando torre específica: ${firstTorre.name} (ID: ${firstTorre.id})`);

    const torreResponse = await fetch(`http://localhost:3001/api/torres/${firstTorre.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!torreResponse.ok) {
      throw new Error(`Failed to get torre by ID: ${torreResponse.status}`);
    }

    const torreData = await torreResponse.json();
    console.log('✅ Torre obtenida exitosamente:');
    console.log('   ID:', torreData.id);
    console.log('   Nombre:', torreData.name);
    console.log('   Descripción:', torreData.description);
    console.log('   Floors/Niveles:', torreData.floors?.length || 0);
    
    if (torreData.floors && torreData.floors.length > 0) {
      console.log('\n📋 Detalles de floors/niveles:');
      torreData.floors.forEach((floor, index) => {
        console.log(`   Floor ${index + 1}:`);
        console.log(`     ID: ${floor.id}`);
        console.log(`     Nombre: ${floor.name}`);
        console.log(`     Número: ${floor.number}`);
        console.log(`     Apartamentos: ${floor.apartments?.length || 0}`);
        console.log(`     Residentes: ${floor._count?.residents || 0}`);
      });
    }

    console.log('\n🎉 Test completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en el test:', error.message);
  }
}

testTorreById();
