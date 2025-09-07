// Test ultra simple para verificar ruta sin auth
import fetch from 'node-fetch';

async function testSimpleRoute() {
  try {
    console.log('� Probando ruta sin auth...');
    
    const response = await fetch('http://localhost:3001/api/companeros/building/test/floor/1', {
      method: 'GET',
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const text = await response.text();
    console.log(`Response: ${text.substring(0, 200)}...`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSimpleRoute();
