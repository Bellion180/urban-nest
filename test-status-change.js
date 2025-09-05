import fetch from 'node-fetch';

async function testStatusChange() {
  console.log('🧪 Probando cambio de estatus de residentes...');
  
  try {
    // 1. Hacer login primero
    console.log('\n1. Haciendo login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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

    // 2. Obtener lista de residentes
    console.log('\n2. Obteniendo residentes...');
    const residentsResponse = await fetch('http://localhost:3001/api/residents', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const residents = await residentsResponse.json();
    console.log(`📋 Residentes encontrados: ${residents.length}`);
    
    if (residents.length === 0) {
      console.log('❌ No hay residentes para probar');
      return;
    }
    
    const firstResident = residents[0];
    console.log(`👤 Probando con: ${firstResident.nombre} ${firstResident.apellido} (${firstResident.estatus})`);

    // 3. Cambiar estatus
    console.log('\n3. Cambiando estatus...');
    const newStatus = firstResident.estatus === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
    console.log(`🔄 Cambiando de ${firstResident.estatus} a ${newStatus}`);
    
    const statusResponse = await fetch(`http://localhost:3001/api/residents/${firstResident.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ estatus: newStatus })
    });
    
    console.log(`📋 Status de respuesta: ${statusResponse.status}`);
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Estatus cambiado exitosamente:', statusData.message);
      console.log(`📊 Nuevo estatus: ${statusData.resident.estatus}`);
    } else {
      const errorData = await statusResponse.json();
      console.log('❌ Error al cambiar estatus:', errorData.error);
    }

    // 4. Verificar el cambio obteniendo el residente actualizado
    console.log('\n4. Verificando cambio...');
    const verifyResponse = await fetch('http://localhost:3001/api/residents', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const updatedResidents = await verifyResponse.json();
    const updatedResident = updatedResidents.find(r => r.id === firstResident.id);
    
    if (updatedResident) {
      console.log(`✅ Verificación: ${updatedResident.nombre} ${updatedResident.apellido} está ${updatedResident.estatus}`);
    }

  } catch (error) {
    console.error('❌ Error en test de cambio de estatus:', error.message);
  }
}

// Ejecutar la función
testStatusChange().then(() => process.exit(0));
