import fetch from 'node-fetch';

async function testMinimal() {
  try {
    console.log('🧪 Test servidor mínimo...');
    
    const response = await fetch('http://localhost:3002/test');
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Resultado:', result);
    } else {
      console.log('❌ Error en servidor mínimo');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMinimal();
