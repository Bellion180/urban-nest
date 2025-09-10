const axios = require('axios');

const baseURL = 'http://localhost:3001';

async function simpleTest() {
  try {
    console.log('🔐 Obteniendo token...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido:', token.substring(0, 50) + '...');

    console.log('📊 Probando GET companeros...');
    const getResponse = await axios.get(`${baseURL}/api/companeros`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ GET exitoso:', getResponse.status);
    console.log('📊 Cantidad de companeros:', getResponse.data.length);

    // Ahora probemos POST sin archivos
    console.log('👤 Probando POST simple...');
    const postResponse = await axios.post(`${baseURL}/api/companeros`, {
      nombre: 'Juan',
      apellidos: 'Pérez',
      fecha_nacimiento: '1990-01-01',
      no_personas: '2',
      no_des_per: '0',
      recibo_apoyo: 'false',
      no_apoyo: '0',
      id_departamento: 'cmfbw9xey0002fafgexj98jy4'
    }, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ POST exitoso:', postResponse.status);
    console.log('📊 Respuesta:', JSON.stringify(postResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Data:', error.response.data);
    }
  }
}

simpleTest();
