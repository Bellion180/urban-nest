import axios from 'axios';

const baseURL = 'http://localhost:3001';

async function testCompanerosRoutes() {
  console.log('🔍 Testing companeros routes (with and without auth)...\n');

  // Test debug endpoint (no auth)
  try {
    const debugResponse = await axios.get(`${baseURL}/api/debug/companeros`);
    console.log('✅ /api/debug/companeros:', debugResponse.status, debugResponse.data.message);
  } catch (error) {
    console.log('❌ /api/debug/companeros:', error.response?.status || 'ERROR');
  }

  // Test companeros without auth (should fail)
  try {
    const companerosResponse = await axios.get(`${baseURL}/api/companeros`);
    console.log('✅ /api/companeros (no auth):', companerosResponse.status);
  } catch (error) {
    console.log('❌ /api/companeros (no auth):', error.response?.status || 'ERROR', error.response?.data?.error || '');
  }

  // Test companeros-no-auth (should work)
  try {
    const companerosNoAuthResponse = await axios.get(`${baseURL}/api/companeros-no-auth`);
    console.log('✅ /api/companeros-no-auth:', companerosNoAuthResponse.status, 'Records:', companerosNoAuthResponse.data.length);
  } catch (error) {
    console.log('❌ /api/companeros-no-auth:', error.response?.status || 'ERROR', error.response?.data?.error || error.message);
  }

  // Test companeros test-simple without auth
  try {
    const testSimpleResponse = await axios.get(`${baseURL}/api/companeros-no-auth/test-simple`);
    console.log('✅ /api/companeros-no-auth/test-simple:', testSimpleResponse.status, testSimpleResponse.data.message);
  } catch (error) {
    console.log('❌ /api/companeros-no-auth/test-simple:', error.response?.status || 'ERROR', error.response?.data?.error || error.message);
  }
}

testCompanerosRoutes();
