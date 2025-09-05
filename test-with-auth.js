// Test con autenticación
console.log('🧪 Test con auth...');

async function testWithAuth() {
  try {
    // Login primero
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

    // Test endpoint simple CON auth
    console.log('🔍 Probando PUT /api/residents/test-simple CON auth');
    const response = await fetch('http://localhost:3001/api/residents/test-simple', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('📊 Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta:', data.message);
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }

  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
}

testWithAuth();
