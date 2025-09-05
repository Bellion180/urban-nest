import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('🔍 Probando endpoints de residentes...\n');

    // Login primero para obtener token
    console.log('1️⃣ Haciendo login...');
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
      throw new Error('Login falló');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso\n');

    // Obtener todos los residentes
    console.log('2️⃣ Obteniendo todos los residentes...');
    console.log('   URL:', 'http://localhost:3001/api/residents');
    const residentsResponse = await fetch('http://localhost:3001/api/residents', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('   Status:', residentsResponse.status);
    console.log('   Status Text:', residentsResponse.statusText);

    if (residentsResponse.ok) {
      const residents = await residentsResponse.json();
      console.log(`✅ Encontrados ${residents.length} residentes`);
      
      // Log completo del primer residente para debug
      if (residents.length > 0) {
        console.log('\n🔍 JSON completo del primer residente:');
        console.log(JSON.stringify(residents[0], null, 2));
        
        console.log('\n📋 Información de todos los residentes:');
        residents.forEach((resident, index) => {
          console.log(`\n🔸 Residente ${index + 1}:`);
          console.log('   Nombre:', resident.nombre, resident.apellido);
          console.log('   Email:', resident.email);
          console.log('   Deuda Actual:', resident.deudaActual);
          console.log('   Pagos Realizados:', resident.pagosRealizados);
          
          if (resident.inviInfo) {
            console.log('   ✅ TIENE información INVI:');
            console.log('     - ID INVI:', resident.inviInfo.idInvi);
            console.log('     - Mensualidades:', resident.inviInfo.mensualidades);
            console.log('     - Deuda INVI:', resident.inviInfo.deuda);
          } else {
            console.log('   ❌ Sin información INVI');
          }

          if (resident.recentPayments && resident.recentPayments.length > 0) {
            console.log(`   💰 Pagos recientes (${resident.recentPayments.length})`);
          } else {
            console.log('   ❌ Sin pagos recientes');
          }
        });
      }
    } else {
      console.log('❌ Error obteniendo residentes');
    }

    console.log('\n🎉 Prueba de API completada');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

testAPI();
