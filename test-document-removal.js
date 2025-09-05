// Test para verificar la eliminación de documentos
console.log('🧪 Iniciando test de eliminación de documentos...');

const API_BASE = 'http://localhost:3001/api';

async function testDocumentRemoval() {
  try {
    // 1. Login para obtener token
    console.log('1. Obteniendo token de autenticación...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    console.log('✅ Token obtenido exitosamente');

    // 2. Obtener lista de residentes
    console.log('2. Obteniendo lista de residentes...');
    const residentsResponse = await fetch(`${API_BASE}/residents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!residentsResponse.ok) {
      throw new Error(`Failed to get residents: ${residentsResponse.status}`);
    }

    const residentsData = await residentsResponse.json();
    const residents = residentsData.residents || residentsData;
    
    if (!residents || residents.length === 0) {
      console.log('❌ No hay residentes para probar');
      return;
    }

    // 3. Encontrar un residente con documentos
    console.log('3. Buscando residente con documentos...');
    const residentWithDocs = residents.find(r => 
      r.documentoCurp || 
      r.documentoComprobanteDomicilio || 
      r.documentoActaNacimiento || 
      r.documentoIne
    );

    if (!residentWithDocs) {
      console.log('❌ No se encontró ningún residente con documentos para probar');
      return;
    }

    console.log(`✅ Residente encontrado: ${residentWithDocs.nombre} ${residentWithDocs.apellido}`);
    console.log('📄 Documentos actuales:');
    console.log(`   - CURP: ${residentWithDocs.documentoCurp || 'No disponible'}`);
    console.log(`   - Comprobante: ${residentWithDocs.documentoComprobanteDomicilio || 'No disponible'}`);
    console.log(`   - Acta: ${residentWithDocs.documentoActaNacimiento || 'No disponible'}`);
    console.log(`   - INE: ${residentWithDocs.documentoIne || 'No disponible'}`);

    // 4. Probar eliminación de documento
    console.log('4. Probando eliminación de documentos...');
    
    const formData = new FormData();
    
    // Agregar datos básicos del residente
    formData.append('nombre', residentWithDocs.nombre || '');
    formData.append('apellido', residentWithDocs.apellido || '');
    formData.append('buildingId', residentWithDocs.buildingId || '');
    formData.append('apartmentNumber', residentWithDocs.apartmentNumber || '');
    formData.append('floorNumber', residentWithDocs.floorNumber || '');
    
    // Determinar qué documento eliminar (el primero que esté disponible)
    let docToRemove = null;
    if (residentWithDocs.documentoCurp) {
      docToRemove = 'curp';
    } else if (residentWithDocs.documentoComprobanteDomicilio) {
      docToRemove = 'comprobanteDomicilio';
    } else if (residentWithDocs.documentoActaNacimiento) {
      docToRemove = 'actaNacimiento';
    } else if (residentWithDocs.documentoIne) {
      docToRemove = 'ine';
    }

    if (!docToRemove) {
      console.log('❌ No hay documentos para eliminar');
      return;
    }

    formData.append('removeDocuments', JSON.stringify([docToRemove]));
    
    console.log(`🗑️  Eliminando documento: ${docToRemove}`);

    const updateResponse = await fetch(`${API_BASE}/residents/${residentWithDocs.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Update failed: ${updateResponse.status} - ${errorText}`);
    }

    const updateData = await updateResponse.json();
    console.log('✅ Actualización exitosa!');

    // 5. Verificar que el documento fue eliminado
    console.log('5. Verificando eliminación...');
    const verifyResponse = await fetch(`${API_BASE}/residents/${residentWithDocs.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!verifyResponse.ok) {
      throw new Error(`Verification failed: ${verifyResponse.status}`);
    }

    const verifyData = await verifyResponse.json();
    const updatedResident = verifyData.resident || verifyData;

    console.log('📄 Documentos después de la eliminación:');
    console.log(`   - CURP: ${updatedResident.documentoCurp || 'No disponible'}`);
    console.log(`   - Comprobante: ${updatedResident.documentoComprobanteDomicilio || 'No disponible'}`);
    console.log(`   - Acta: ${updatedResident.documentoActaNacimiento || 'No disponible'}`);
    console.log(`   - INE: ${updatedResident.documentoIne || 'No disponible'}`);

    // Verificar que el documento específico fue eliminado
    const docFieldMap = {
      'curp': 'documentoCurp',
      'comprobanteDomicilio': 'documentoComprobanteDomicilio',
      'actaNacimiento': 'documentoActaNacimiento',
      'ine': 'documentoIne'
    };

    const removedField = docFieldMap[docToRemove];
    if (!updatedResident[removedField]) {
      console.log(`✅ ¡El documento ${docToRemove} fue eliminado exitosamente!`);
    } else {
      console.log(`❌ El documento ${docToRemove} NO fue eliminado`);
    }

  } catch (error) {
    console.error('❌ Error en el test:', error.message);
  }
}

// Ejecutar el test
testDocumentRemoval().then(() => {
  console.log('🏁 Test completado');
}).catch(error => {
  console.error('💥 Test falló:', error);
});
