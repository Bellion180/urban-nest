import fetch from 'node-fetch';

async function testSimpleDocumentRemoval() {
  try {
    console.log('🧪 Test simple de eliminación de documentos...');
    
    // 1. Login para obtener token
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
    console.log('✅ Token obtenido');

    // 2. Hacer PUT con removeDocuments como JSON
    const updateData = {
      name: 'Test User Updated',
      removeDocuments: ['curp', 'ine'] // Array directo en JSON
    };

    console.log('🔍 Enviando datos JSON:', JSON.stringify(updateData, null, 2));
    console.log('🔍 URL:', 'http://localhost:3001/api/residents/cmf6ejoej0001faesncq3env7');

    const response = await fetch('http://localhost:3001/api/residents/cmf6ejoej0001faesncq3env7', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    console.log('📊 Status:', response.status);
    const result = await response.json();
    console.log('📊 Response:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Test exitoso:', result.message);
    } else {
      console.log('❌ Error en test:', result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSimpleDocumentRemoval();
