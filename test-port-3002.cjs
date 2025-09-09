const http = require('http');

function testPort3002() {
  console.log('🔍 Probando conexión al puerto 3002...');
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/test',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('✅ Conexión exitosa al puerto 3002!');
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
    console.error('💥 Error de conexión:', err.message);
  });

  req.setTimeout(5000, () => {
    console.error('⏰ Timeout de conexión');
    req.destroy();
  });

  req.end();
}

testPort3002();
