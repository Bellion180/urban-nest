import fetch from 'node-fetch';

async function testPutSimple() {
  console.log('🧪 Testing simple PUT...');
  
  try {
    console.log('1. Testing PUT /api/test/123...');
    const putResponse = await fetch('http://localhost:3001/api/test/123', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data', name: 'test building' })
    });
    
    console.log('PUT Response status:', putResponse.status);
    console.log('PUT Response ok:', putResponse.ok);
    
    if (putResponse.ok) {
      const putData = await putResponse.json();
      console.log('✅ PUT Response data:', putData);
    } else {
      const errorText = await putResponse.text();
      console.log('❌ PUT Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPutSimple();
