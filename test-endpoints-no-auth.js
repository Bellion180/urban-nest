import axios from 'axios';

const baseURL = 'http://localhost:3001';

async function testEndpoints() {
  console.log('🔍 Testing endpoints without authentication...\n');

  // Test health endpoint
  try {
    const healthResponse = await axios.get(`${baseURL}/api/health`);
    console.log('✅ /api/health:', healthResponse.status);
  } catch (error) {
    console.log('❌ /api/health:', error.response?.status || 'ERROR');
  }

  // Test debug endpoint
  try {
    const debugResponse = await axios.get(`${baseURL}/api/debug/companeros`);
    console.log('✅ /api/debug/companeros:', debugResponse.status);
  } catch (error) {
    console.log('❌ /api/debug/companeros:', error.response?.status || 'ERROR');
  }

  // Test companeros endpoint (should fail due to auth)
  try {
    const companerosResponse = await axios.get(`${baseURL}/api/companeros`);
    console.log('✅ /api/companeros:', companerosResponse.status);
  } catch (error) {
    console.log('❌ /api/companeros:', error.response?.status || 'ERROR', error.response?.data?.error || '');
  }

  // Test torres endpoint (should fail due to auth)
  try {
    const torresResponse = await axios.get(`${baseURL}/api/torres`);
    console.log('✅ /api/torres:', torresResponse.status);
  } catch (error) {
    console.log('❌ /api/torres:', error.response?.status || 'ERROR', error.response?.data?.error || '');
  }

  // Test test-simple endpoint (should fail due to auth)
  try {
    const testResponse = await axios.get(`${baseURL}/api/companeros/test-simple`);
    console.log('✅ /api/companeros/test-simple:', testResponse.status);
  } catch (error) {
    console.log('❌ /api/companeros/test-simple:', error.response?.status || 'ERROR', error.response?.data?.error || '');
  }
}

testEndpoints();
