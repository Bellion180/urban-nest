const fetch = require('node-fetch');

async function testStepByStep() {
  try {
    console.log('🧪 Test paso a paso para eliminación de documentos');

    // Paso 1: Login
    console.log('\n1️⃣ Haciendo login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
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
    console.log('✅ Login exitoso');

    // Paso 2: Obtener lista de residentes
    console.log('\n2️⃣ Obteniendo residentes...');
    const residentsResponse = await fetch('http://localhost:3001/api/residents', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!residentsResponse.ok) {
      throw new Error(`Failed to get residents: ${residentsResponse.status}`);
    }

    const residentsData = await residentsResponse.json();
    const residents = residentsData.residents || residentsData;
    
    if (residents.length === 0) {
      console.log('❌ No hay residentes para probar');
      return;
    }

    // Paso 3: Encontrar residente con documentos
    console.log('\n3️⃣ Buscando residente con documentos...');
    const residentWithDocs = residents.find(r => r.documentoCurp || r.documentoIne);
    
    if (!residentWithDocs) {
      console.log('❌ No se encontró residente con documentos');
      return;
    }

    console.log(`✅ Residente encontrado: ${residentWithDocs.name}`);
    console.log(`📄 CURP: ${residentWithDocs.documentoCurp || 'No'}`);
    console.log(`📄 INE: ${residentWithDocs.documentoIne || 'No'}`);

    // Paso 4: Test simple - solo actualizar nombre (sin tocar documentos)
    console.log('\n4️⃣ Test simple: actualizar solo nombre...');
    const simpleUpdate = {
      name: residentWithDocs.name + ' (Actualizado)'
    };

    const simpleResponse = await fetch(`http://localhost:3001/api/residents/${residentWithDocs.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(simpleUpdate)
    });

    console.log(`📊 Status: ${simpleResponse.status}`);
    
    if (simpleResponse.ok) {
      const result = await simpleResponse.json();
      console.log('✅ Actualización simple exitosa');
    } else {
      const error = await simpleResponse.text();
      console.log(`❌ Error en actualización simple: ${error}`);
      return;
    }

    // Paso 5: Test con eliminación de documentos
    console.log('\n5️⃣ Test con eliminación de documentos...');
    const updateWithRemoval = {
      name: residentWithDocs.name,
      removeDocuments: ['curp'] // Solo eliminar CURP
    };

    console.log('📝 Datos a enviar:', JSON.stringify(updateWithRemoval, null, 2));

    const removalResponse = await fetch(`http://localhost:3001/api/residents/${residentWithDocs.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateWithRemoval)
    });

    console.log(`📊 Status: ${removalResponse.status}`);
    
    if (removalResponse.ok) {
      const result = await removalResponse.json();
      console.log('✅ Eliminación de documentos exitosa');
      console.log('📋 Resultado:', result.message);
    } else {
      const error = await removalResponse.text();
      console.log(`❌ Error en eliminación: ${error}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testStepByStep();
