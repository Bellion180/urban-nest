import fetch from 'node-fetch';

async function testServerLogs() {
  console.log('🧪 Testing server from external script...');
  
  try {
    console.log('1. Making GET request to /api/health...');
    const response = await fetch('http://localhost:3001/api/health');
    const data = await response.json();
    console.log('✅ Response:', response.status, data);
    
    console.log('2. Making PUT request to /api/test/123...');
    const putResponse = await fetch('http://localhost:3001/api/test/123', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data', name: 'test building' })
    });
    const putData = await putResponse.json();
    console.log('✅ PUT Response:', putResponse.status, putData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testServerLogs();
