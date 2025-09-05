// Test básico del endpoint PUT
console.log('🧪 Test básico PUT...');

async function testBasicPut() {
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

    // 2. Test PUT básico SIN removeDocuments
    const testId = 'cmf6ejoej0001faesncq3env7';
    
    const updateData = {
      nombre: 'Test Usuario'
    };

    console.log('🔍 Haciendo PUT básico a:', `http://localhost:3001/api/residents/${testId}`);
    
    const updateResponse = await fetch(`http://localhost:3001/api/residents/${testId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    console.log('📊 Status:', updateResponse.status);
    
    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ PUT básico funcionó:', result.message);
    } else {
      const error = await updateResponse.text();
      console.log('❌ Error en PUT básico:', error);
    }

  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
}

testBasicPut();
