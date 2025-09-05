// Quick test to see API response format
import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('🔍 Testing API response format...');
    
    // Login first
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    // Get residents
    const residentsResponse = await fetch('http://localhost:3001/api/residents', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const residents = await residentsResponse.json();
    console.log('\n📋 Residents API Response:');
    console.log(JSON.stringify(residents, null, 2));
    
    if (residents.length > 0) {
      console.log('\n🎯 First resident structure:');
      console.log('Available fields:', Object.keys(residents[0]));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
