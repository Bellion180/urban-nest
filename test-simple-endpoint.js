// Test simple para verificar el endpoint
console.log('🧪 Test simple de endpoint...');

async function simpleTest() {
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

    // 2. Test directo al endpoint
    const testId = 'cmf6ejoej0001faesncq3env7'; // ID de prueba
    const url = `http://localhost:3001/api/residents/${testId}/with-documents`;
    console.log('🌐 URL de prueba:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: new FormData() // FormData vacío solo para probar la ruta
    });

    console.log('📊 Status de respuesta:', response.status);
    const responseText = await response.text();
    console.log('📄 Respuesta:', responseText);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

simpleTest();
