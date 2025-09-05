// Test simple para verificar CORS con PATCH
console.log('🧪 Probando CORS con PATCH...');

// Simular una petición desde el navegador
const testCORS = async () => {
  try {
    // Primero hacer login
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8080'
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
    console.log('✅ Login exitoso');

    // Obtener residentes
    const residentsResponse = await fetch('http://localhost:3001/api/residents', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:8080'
      }
    });

    const residents = await residentsResponse.json();
    if (residents.length === 0) {
      console.log('❌ No hay residentes para probar');
      return;
    }

    const resident = residents[0];
    console.log(`👤 Probando con: ${resident.nombre} ${resident.apellido}`);

    // Probar PATCH con headers CORS explícitos
    console.log('🔄 Probando PATCH con CORS...');
    const patchResponse = await fetch(`http://localhost:3001/api/residents/${resident.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:8080'
      },
      body: JSON.stringify({ 
        estatus: resident.estatus === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO' 
      })
    });

    console.log(`📋 Status: ${patchResponse.status}`);
    console.log(`📋 Headers:`, Object.fromEntries(patchResponse.headers.entries()));

    if (patchResponse.ok) {
      const result = await patchResponse.json();
      console.log('✅ PATCH exitoso:', result.message);
    } else {
      const error = await patchResponse.text();
      console.log('❌ PATCH falló:', error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Importar fetch para Node.js
import fetch from 'node-fetch';
testCORS().then(() => process.exit(0));
