// Script simple para probar rutas de companeros
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function testSimple() {
  try {
    // Login
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      }),
    });
    const { token } = await loginResponse.json();
    console.log('✅ Login OK');

    // Probar ruta base companeros
    const companeros = await fetch(`${API_BASE_URL}/companeros`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log(`📋 /companeros status: ${companeros.status}`);
    
    if (companeros.ok) {
      const data = await companeros.json();
      console.log(`✅ Companeros obtenidos: ${data.length}`);
    }

    // Probar nueva ruta
    const newRoute = await fetch(`${API_BASE_URL}/companeros/building/test/floor/1`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log(`📋 Nueva ruta status: ${newRoute.status}`);
    
    if (newRoute.ok) {
      const data = await newRoute.json();
      console.log(`✅ Nueva ruta funciona: ${data.length} residentes`);
    } else {
      console.log(`❌ Nueva ruta error: ${newRoute.statusText}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSimple();
