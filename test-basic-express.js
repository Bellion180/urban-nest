import axios from 'axios';

const baseURL = 'http://localhost:3002';

async function testBasicRoutes() {
  console.log('🔍 Testing basic Express routing...\n');

  try {
    const response1 = await axios.get(`${baseURL}/api/test-companeros`);
    console.log('✅ /api/test-companeros:', response1.status, response1.data);
  } catch (error) {
    console.log('❌ /api/test-companeros:', error.response?.status || 'ERROR', error.response?.data || error.message);
  }

  try {
    const response2 = await axios.get(`${baseURL}/api/test-companeros/test`);
    console.log('✅ /api/test-companeros/test:', response2.status, response2.data);
  } catch (error) {
    console.log('❌ /api/test-companeros/test:', error.response?.status || 'ERROR', error.response?.data || error.message);
  }
}

testBasicRoutes();
