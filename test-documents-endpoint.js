import fetch from 'node-fetch';
import FormData from 'form-data';

async function testDocumentsEndpoint() {
  try {
    console.log('🧪 Test del endpoint /documents...');
    
    // 1. Login
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

    // 2. Crear FormData con archivo de prueba
    const formData = new FormData();
    
    // Crear un archivo de prueba
    const testContent = '%PDF-1.4\nTest PDF content for testing upload';
    formData.append('documents_curp', testContent, {
      filename: 'test-curp.pdf',
      contentType: 'application/pdf'
    });

    console.log('📁 Enviando al endpoint /documents...');

    const response = await fetch('http://localhost:3001/api/residents/cmf6ejoej0001faesncq3env7/documents', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test exitoso:', result.message);
    } else {
      const errorText = await response.text();
      console.log('❌ Error:', errorText);
    }

  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
}

testDocumentsEndpoint();
