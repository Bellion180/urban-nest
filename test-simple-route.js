// Test ruta simple de companeros
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function testSimpleCompanerosRoute() {
  try {
    // Login
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      }),
    });
    const { token } = await loginRes.json();
    console.log('✅ Login OK');

    // Probar ruta simple
    const testRes = await fetch(`${API_BASE_URL}/companeros/test-simple`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    console.log(`📋 Test simple status: ${testRes.status}`);
    
    if (testRes.ok) {
      const data = await testRes.json();
      console.log('✅ Test simple funcionó:', data.message);
    } else {
      const error = await testRes.text();
      console.log('❌ Test simple error:', error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSimpleCompanerosRoute();
