const API_BASE = 'http://localhost:3001/api';

// Test para actualizar información de residente
async function testEditResident() {
  try {
    console.log('🧪 Iniciando test de edición de residente...');
    
    // 0. Primero obtenemos un token de autenticación
    console.log('🔐 Obteniendo token de autenticación...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
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
      console.log('❌ Error en login:', loginResponse.statusText);
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Token obtenido exitosamente');
    
    // 1. Primero obtenemos la lista de residentes
    const residentsResponse = await fetch(`${API_BASE}/residents`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status de respuesta:', residentsResponse.status);
    console.log('📡 Headers de respuesta:', residentsResponse.headers);
    
    if (!residentsResponse.ok) {
      console.log('❌ Error en la respuesta:', residentsResponse.statusText);
      return;
    }
    
    const residents = await residentsResponse.json();
    
    console.log('📊 Respuesta completa:', JSON.stringify(residents, null, 2));
    console.log('📊 Tipo de respuesta:', typeof residents);
    console.log('📊 Es array:', Array.isArray(residents));
    
    if (!residents || residents.length === 0) {
      console.log('❌ No hay residentes para editar');
      return;
    }
    
    const resident = residents[0];
    console.log('📋 Residente original:', JSON.stringify(resident, null, 2));
    
    // 2. Preparamos datos de prueba para la actualización
    const updateData = {
      // Información personal
      nombre: 'Juan Carlos (Editado)',
      apellido: 'Pérez Modificado',
      telefono: '0424-999-8888',
      email: 'juan.editado@ejemplo.com',
      fechaNacimiento: '1985-05-15',
      edad: 39,
      noPersonas: 3,
      discapacidad: false // Boolean en lugar de string
    };
    
    console.log('📝 Datos de actualización:', JSON.stringify(updateData, null, 2));
    
    // 3. Realizamos la actualización
    const response = await fetch(`${API_BASE}/residents/${resident.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('✅ Actualización exitosa:', response.status);
    const responseData = await response.json();
    console.log('📊 Datos actualizados:', JSON.stringify(responseData, null, 2));
    
    // 4. Verificamos que los cambios se guardaron
    const verifyResponse = await fetch(`${API_BASE}/residents`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const allResidents = await verifyResponse.json();
    const updatedResident = allResidents.find(r => r.id === resident.id);
    
    console.log('🔍 Verificación - Residente actualizado:', JSON.stringify(updatedResident, null, 2));
    
    // Verificar algunos campos específicos
    if (updatedResident.nombre === updateData.nombre) {
      console.log('✅ Nombre actualizado correctamente');
    } else {
      console.log('❌ Error: Nombre no se actualizó');
    }
    
    if (updatedResident.telefono === updateData.telefono) {
      console.log('✅ Teléfono actualizado correctamente');
    } else {
      console.log('❌ Error: Teléfono no se actualizó');
    }
    
    if (updatedResident.noPersonas === updateData.noPersonas) {
      console.log('✅ Número de personas actualizado correctamente');
    } else {
      console.log('❌ Error: Número de personas no se actualizó');
    }
    
    console.log('🎉 Test completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Ejecutar el test
testEditResident();
