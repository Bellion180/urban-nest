// Test de rutas residentes
console.log('🧪 Test de rutas residentes...');

async function testRoutes() {
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

    // 2. Test GET residents (debe funcionar)
    console.log('🔍 Probando GET /api/residents...');
    const getResponse = await fetch('http://localhost:3001/api/residents', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('📊 GET Status:', getResponse.status);

    // 3. Test PUT normal (debe funcionar)
    const residents = await getResponse.json();
    const firstResident = (residents.residents || residents)[0];
    
    if (firstResident) {
      console.log('🔍 Probando PUT normal /api/residents/' + firstResident.id);
      const putResponse = await fetch(`http://localhost:3001/api/residents/${firstResident.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: firstResident.nombre
        })
      });
      console.log('📊 PUT normal Status:', putResponse.status);
      
      // 4. Test PUT with-documents (el que no funciona)
      console.log('🔍 Probando PUT con documentos /api/residents/' + firstResident.id + '/with-documents');
      const putDocResponse = await fetch(`http://localhost:3001/api/residents/${firstResident.id}/with-documents`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: new FormData()
      });
      console.log('📊 PUT with-documents Status:', putDocResponse.status);
      
      if (putDocResponse.status !== 200) {
        const errorText = await putDocResponse.text();
        console.log('❌ Error:', errorText);
      }
    }

  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
}

testRoutes();
