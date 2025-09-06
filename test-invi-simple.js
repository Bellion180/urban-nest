import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testInviUpdate() {
  try {
    console.log('🔍 Obteniendo lista de residentes...');
    
    // Obtener un residente existente
    const residentsResponse = await fetch(`${API_BASE}/residents`);
    const residents = await residentsResponse.json();
    
    if (!residents || residents.length === 0) {
      console.log('❌ No hay residentes en la base de datos para probar');
      return;
    }
    
    const testResident = residents[0];
    console.log(`✅ Residente encontrado: ${testResident.nombre} ${testResident.apellido} (ID: ${testResident.id})`);
    
    // Datos de prueba para actualizar solo información INVI
    const updateData = {
      nombre: testResident.nombre,
      apellido: testResident.apellido,
      email: testResident.email || 'test@test.com',
      telefono: testResident.telefono || '1234567890',
      edad: testResident.edad || 30,
      noPersonas: testResident.noPersonas || 1,
      deudaActual: testResident.deudaActual || 0,
      pagosRealizados: testResident.pagosRealizados || 0,
      informe: testResident.informe || '',
      // Información INVI actualizada
      inviInfo: {
        idInvi: 'INVI-2024-TEST-001',
        mensualidades: '360 meses',
        deuda: 750000,
        fechaContrato: '2024-01-15',
        idCompanero: 'COMP-TEST-001'
      }
    };
    
    console.log('📝 Enviando actualización con datos INVI...');
    console.log('Datos INVI:', JSON.stringify(updateData.inviInfo, null, 2));
    
    const updateResponse = await fetch(`${API_BASE}/residents/${testResident.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token' // Para bypass del auth en desarrollo
      },
      body: JSON.stringify(updateData)
    });
    
    const responseText = await updateResponse.text();
    console.log('📄 Respuesta del servidor:', responseText);
    
    if (!updateResponse.ok) {
      console.log('❌ Error en la actualización:', updateResponse.status, responseText);
      return;
    }
    
    const result = JSON.parse(responseText);
    console.log('✅ Residente actualizado exitosamente');
    
    // Verificar que los datos INVI se guardaron correctamente
    console.log('🔍 Verificando datos INVI guardados...');
    const verifyResponse = await fetch(`${API_BASE}/residents/${testResident.id}`, {
      headers: {
        'Authorization': 'Bearer fake-token'
      }
    });
    
    const verifiedResident = await verifyResponse.json();
    
    console.log('📊 Información INVI verificada:');
    console.log('- ID INVI:', verifiedResident.idInvi);
    console.log('- Mensualidades:', verifiedResident.mensualidades);
    console.log('- Deuda:', verifiedResident.deuda);
    console.log('- Fecha Contrato:', verifiedResident.fechaContrato);
    console.log('- ID Compañero:', verifiedResident.idCompanero);
    
    if (verifiedResident.idInvi === 'INVI-2024-TEST-001') {
      console.log('✅ Los datos INVI se guardaron correctamente');
    } else {
      console.log('❌ Los datos INVI no se guardaron correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar la prueba
testInviUpdate();
