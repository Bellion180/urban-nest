const fetch = require('node-fetch');

async function testLogin() {
  console.log('🔐 Probando login...');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.token) {
      console.log('✅ Token obtenido:', data.token.substring(0, 20) + '...');
      
      // Probar endpoint de companeros
      console.log('\n👥 Probando /api/companeros...');
      const companerosResponse = await fetch('http://localhost:3001/api/companeros', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      console.log('Companeros status:', companerosResponse.status);
      const companerosText = await companerosResponse.text();
      console.log('Companeros response:', companerosText.substring(0, 200));
      
      // Probar endpoint de residents (que debería redirigir a companeros)
      console.log('\n👥 Probando /api/residents...');
      const residentsResponse = await fetch('http://localhost:3001/api/residents', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      console.log('Residents status:', residentsResponse.status);
      if (residentsResponse.ok) {
        const residentsData = await residentsResponse.json();
        console.log('Residents response OK - items:', residentsData.length);
      } else {
        const residentsText = await residentsResponse.text();
        console.log('Residents response ERROR:', residentsText.substring(0, 200));
      }
      
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
