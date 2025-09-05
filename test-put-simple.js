// Test de eliminación de documentos usando endpoint normal
console.log('🧪 Test de eliminación con endpoint normal...');

async function testDocumentRemovalNormal() {
  try {
    // 1. Login
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Token obtenido');

    // 2. Obtener residentes
    const residentsResponse = await fetch('http://localhost:3001/api/residents', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const residentsData = await residentsResponse.json();
    const residents = residentsData.residents || residentsData;
    
    // 3. Encontrar residente con documentos
    const residentWithDocs = residents.find(r => 
      r.documentoCurp || 
      r.documentoComprobanteDomicilio || 
      r.documentoActaNacimiento || 
      r.documentoIne
    );

    if (!residentWithDocs) {
      console.log('❌ No hay residentes con documentos para probar');
      return;
    }

    console.log(`✅ Residente encontrado: ${residentWithDocs.nombre} ${residentWithDocs.apellido}`);
    console.log('📄 Documentos actuales:');
    console.log(`   - CURP: ${residentWithDocs.documentoCurp || 'No disponible'}`);
    console.log(`   - Comprobante: ${residentWithDocs.documentoComprobanteDomicilio || 'No disponible'}`);
    console.log(`   - Acta: ${residentWithDocs.documentoActaNacimiento || 'No disponible'}`);
    console.log(`   - INE: ${residentWithDocs.documentoIne || 'No disponible'}`);

    // 4. Determinar qué documento eliminar
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

    console.log(`🗑️  Eliminando documento: ${docToRemove}`);

    // 5. Hacer PUT request al endpoint normal con removeDocuments
    const updateData = {
      nombre: residentWithDocs.nombre,
      apellido: residentWithDocs.apellido,
      removeDocuments: JSON.stringify([docToRemove])
    };

    const updateResponse = await fetch(`http://localhost:3001/api/residents/${residentWithDocs.id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    console.log('📊 Status:', updateResponse.status);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Update failed: ${updateResponse.status} - ${errorText}`);
    }

    const updateResult = await updateResponse.json();
    console.log('✅ Actualización exitosa!');

    // 6. Verificar que el documento fue eliminado
    console.log('5. Verificando eliminación...');
    const verifyResponse = await fetch(`http://localhost:3001/api/residents/${residentWithDocs.id}`, {
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

testDocumentRemovalNormal();
