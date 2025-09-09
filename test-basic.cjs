const http = require('http');

function testBasicServer() {
  console.log('🔍 Probando servidor HTTP básico...');
  
  const options = {
    hostname: 'localhost',
    port: 3003,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('✅ ¡Conexión exitosa!');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📋 Respuesta:', data);
    });
  });

  req.on('error', (err) => {
    console.error('💥 Error:', err.message);
  });

  req.end();
}

testBasicServer();
