// Test de diferentes formatos de ruta
console.log('🧪 Test de formatos de ruta...');

async function testFormats() {
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

    const testId = 'cmf6ejoej0001faesncq3env7';

    // 2. Test formato /documents/:id
    console.log('🔍 Probando PUT /api/residents/documents/' + testId);
    const docResponse = await fetch(`http://localhost:3001/api/residents/documents/${testId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('📊 Documents Status:', docResponse.status);
    if (docResponse.ok) {
      const docData = await docResponse.json();
      console.log('✅ Respuesta:', docData.message);
    } else {
      const docError = await docResponse.text();
      console.log('❌ Error:', docError);
    }

    // 3. Test formato /:id/with-documents
    console.log('🔍 Probando PUT /api/residents/' + testId + '/with-documents');
    const withDocResponse = await fetch(`http://localhost:3001/api/residents/${testId}/with-documents`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('📊 With-documents Status:', withDocResponse.status);
    if (withDocResponse.ok) {
      const withDocData = await withDocResponse.json();
      console.log('✅ Respuesta:', withDocData.message);
    } else {
      const withDocError = await withDocResponse.text();
      console.log('❌ Error:', withDocError);
    }

  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
}

testFormats();
