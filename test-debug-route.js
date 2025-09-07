// Test ruta de debug
import fetch from 'node-fetch';

async function testDebugRoute() {
  try {
    console.log('🔍 Probando ruta de debug sin auth...');
    
    const response = await fetch('http://localhost:3001/api/debug/companeros');
    
    console.log(`📋 Debug status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Debug route funcionó:', data.message);
    } else {
      const error = await response.text();
      console.log('❌ Debug route error:', error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDebugRoute();
