import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testEditResidentWithInvi() {
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
    
    // Datos de prueba para actualizar la información INVI
    const updateData = {
      nombre: testResident.nombre,
      apellido: testResident.apellido,
      email: testResident.email,
      telefono: testResident.telefono,
      edad: testResident.edad || 30,
      noPersonas: testResident.noPersonas || 1,
      deudaActual: testResident.deudaActual || 0,
      pagosRealizados: testResident.pagosRealizados || 0,
      informe: testResident.informe || '',
      // Información INVI actualizada
      inviInfo: {
        idInvi: 'INVI-2024-EDIT-TEST',
        mensualidades: '240 meses',
        deuda: 850000.50,
        fechaContrato: '2024-01-15',
        idCompanero: 'COMP-2024-001'
      }
    };
    
    console.log('📝 Actualizando información INVI del residente...');
    console.log('Datos INVI a enviar:', JSON.stringify(updateData.inviInfo, null, 2));
    
    const updateResponse = await fetch(`${API_BASE}/residents/${testResident.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.log('❌ Error en la actualización:', error);
      return;
    }
    
    const updatedResult = await updateResponse.json();
    console.log('✅ Residente actualizado exitosamente');
    
    // Verificar que los datos INVI se guardaron correctamente
    console.log('🔍 Verificando datos INVI guardados...');
    const verifyResponse = await fetch(`${API_BASE}/residents/${testResident.id}`);
    const verifiedResident = await verifyResponse.json();
    
    console.log('📊 Información INVI verificada:');
    console.log('- ID INVI:', verifiedResident.inviInfo?.idInvi);
    console.log('- Mensualidades:', verifiedResident.inviInfo?.mensualidades);
    console.log('- Deuda:', verifiedResident.inviInfo?.deuda);
    console.log('- Fecha Contrato:', verifiedResident.inviInfo?.fechaContrato);
    console.log('- ID Compañero:', verifiedResident.inviInfo?.idCompanero);
    
    if (verifiedResident.inviInfo?.idInvi === 'INVI-2024-EDIT-TEST') {
      console.log('✅ Los datos INVI se guardaron correctamente');
    } else {
      console.log('❌ Los datos INVI no se guardaron correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testEditResidentWithInvi();
