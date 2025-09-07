// Debug paso a paso del endpoint
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function debugEndpoint() {
  try {
    // 1. Login y obtener token
    console.log('1️⃣ Haciendo login...');
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      }),
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }
    
    const { token } = await loginRes.json();
    console.log(`✅ Token obtenido: ${token.substring(0, 20)}...`);

    // 2. Probar ruta base companeros
    console.log('\n2️⃣ Probando ruta base /companeros...');
    const baseRes = await fetch(`${API_BASE_URL}/companeros`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log(`📋 Base status: ${baseRes.status}`);

    // 3. Probar ruta específica con diferentes formatos
    console.log('\n3️⃣ Probando ruta específica...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('📡 Headers:', headers);
    
    const testUrl = `${API_BASE_URL}/companeros/building/test123/floor/1`;
    console.log(`📡 URL: ${testUrl}`);
    
    const specificRes = await fetch(testUrl, {
      method: 'GET',
      headers: headers
    });
    
    console.log(`📋 Specific status: ${specificRes.status}`);
    console.log(`📋 Specific status text: ${specificRes.statusText}`);
    
    const responseText = await specificRes.text();
    console.log(`📋 Response: ${responseText.substring(0, 300)}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugEndpoint();
