import fetch from 'node-fetch';

async function testBasic() {
  try {
    console.log('🧪 Test de conectividad básica...');
    
    const response = await fetch('http://localhost:3001/api/health');
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const result = await response.text();
      console.log('✅ Servidor funcionando:', result);
    } else {
      console.log('❌ Error en servidor');
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testBasic();
