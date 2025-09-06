import fetch from 'node-fetch';

async function testSimplePUT() {
  try {
    console.log('🧪 Test PUT simple sin archivos...');
    
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

    // 2. Simple PUT con JSON
    const updateData = {
      nombre: 'Test Simple Update'
    };

    console.log('📝 Enviando PUT simple...');

    const response = await fetch('http://localhost:3001/api/residents/cmf6ejoej0001faesncq3env7', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
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

testSimplePUT();
