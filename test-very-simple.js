// Test del endpoint más simple
console.log('🧪 Test muy simple...');

async function testVerySimple() {
  try {
    console.log('🔍 Probando PUT /api/residents/test-simple');
    const response = await fetch('http://localhost:3001/api/residents/test-simple', {
      method: 'PUT'
    });
    console.log('📊 Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta:', data.message);
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
}

testVerySimple();
