const axios = require('axios');

const baseURL = 'http://localhost:3001';

async function login() {
  try {
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    return loginResponse.data.token;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return null;
  }
}

async function testRoutes() {
  console.log('🔍 Testing route isolation...\n');
  
  const token = await login();
  if (!token) {
    console.log('❌ No se pudo obtener token, abortando tests');
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  // Test routes that work
  console.log('📊 Testing working routes:');
  try {
    const healthResponse = await axios.get(`${baseURL}/api/health`);
    console.log('✅ /api/health:', healthResponse.status);
  } catch (error) {
    console.log('❌ /api/health:', error.response?.status || 'ERROR');
  }

  try {
    const debugResponse = await axios.get(`${baseURL}/api/debug/companeros`);
    console.log('✅ /api/debug/companeros:', debugResponse.status);
  } catch (error) {
    console.log('❌ /api/debug/companeros:', error.response?.status || 'ERROR');
  }

  try {
    const residentsResponse = await axios.get(`${baseURL}/api/residents`, { headers });
    console.log('✅ /api/residents:', residentsResponse.status);
  } catch (error) {
    console.log('❌ /api/residents:', error.response?.status || 'ERROR');
  }

  // Test routes that don't work
  console.log('\n🔍 Testing problematic routes:');
  try {
    const companerosResponse = await axios.get(`${baseURL}/api/companeros`, { headers });
    console.log('✅ /api/companeros:', companerosResponse.status);
  } catch (error) {
    console.log('❌ /api/companeros:', error.response?.status || 'ERROR');
  }

  try {
    const torresResponse = await axios.get(`${baseURL}/api/torres`, { headers });
    console.log('✅ /api/torres:', torresResponse.status);
  } catch (error) {
    console.log('❌ /api/torres:', error.response?.status || 'ERROR');
  }

  try {
    const nivelesResponse = await axios.get(`${baseURL}/api/niveles`, { headers });
    console.log('✅ /api/niveles:', nivelesResponse.status);
  } catch (error) {
    console.log('❌ /api/niveles:', error.response?.status || 'ERROR');
  }

  console.log('\n🔍 Route isolation test completed.');
}

testRoutes();
