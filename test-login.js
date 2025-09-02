import fetch from 'node-fetch';

async function testLogin() {
  console.log('🔐 Probando sistema de login...');
  
  try {
    // Prueba con usuario admin
    console.log('\n1. Probando login con admin...');
    const adminResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin',
        password: 'admin123'
      })
    });
    
    console.log('Status admin:', adminResponse.status);
    const adminData = await adminResponse.json();
    console.log('Response admin:', adminData);
    
    // Prueba con usuario user
    console.log('\n2. Probando login con user...');
    const userResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'user',
        password: 'user123'
      })
    });
    
    console.log('Status user:', userResponse.status);
    const userData = await userResponse.json();
    console.log('Response user:', userData);
    
    // Prueba con credenciales incorrectas
    console.log('\n3. Probando con credenciales incorrectas...');
    const wrongResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'wrong',
        password: 'wrong'
      })
    });
    
    console.log('Status wrong:', wrongResponse.status);
    const wrongData = await wrongResponse.json();
    console.log('Response wrong:', wrongData);
    
  } catch (error) {
    console.error('❌ Error en test de login:', error.message);
  }
}

testLogin();
