// Test simple del endpoint de torres por ID
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testTorreEndpoint() {
  try {
    console.log('🧪 Test del endpoint GET /api/torres/:id...');
    
    // Login
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

    // Test: GET /api/torres (esto sabemos que funciona)
    console.log('\n📋 Probando GET /api/torres...');
    const allResponse = await fetch('http://localhost:3001/api/torres', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('GET /api/torres status:', allResponse.status);
    
    // Test: GET /api/torres/details/:id
    const testId = 'cmf7n23x20001favkxtp3f4ta';
    console.log(`\n🎯 Probando GET /api/torres/details/${testId}...`);
    const byIdResponse = await fetch(`http://localhost:3001/api/torres/details/${testId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('GET /api/torres/details/:id status:', byIdResponse.status);
    console.log('Response headers:', Object.fromEntries(byIdResponse.headers.entries()));
    
    if (byIdResponse.ok) {
      const data = await byIdResponse.json();
      console.log('✅ Datos obtenidos:', JSON.stringify(data, null, 2));
    } else {
      const error = await byIdResponse.text();
      console.log('❌ Error response:', error);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testTorreEndpoint();
