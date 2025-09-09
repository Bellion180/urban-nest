// Simple test para verificar que la API funciona
const https = require('https');
const http = require('http');

// Hacer requests simples sin cerrar el servidor
async function simpleTest() {
  console.log('🧪 Test simple de la API...\n');

  // Test health endpoint
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('✅ Health check:', data);
      testLogin();
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error en health check:', error.message);
  });

  req.end();
}

function testLogin() {
  const postData = JSON.stringify({
    email: 'admin@urbannest.com',
    password: 'admin123'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('✅ Login response:', data);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error en login:', error.message);
  });

  req.write(postData);
  req.end();
}

simpleTest();
