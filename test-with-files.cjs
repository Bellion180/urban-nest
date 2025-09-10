const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const baseURL = 'http://localhost:3001';

async function testWithFiles() {
  try {
    console.log('🔐 Obteniendo token...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido');

    // Crear imagen de prueba
    console.log('📁 Creando archivos de prueba...');
    const testImagePath = path.join(__dirname, 'test-profile-photo.jpg');
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 
      0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 
      0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 
      0xD9 // Final del JPEG
    ]);
    fs.writeFileSync(testImagePath, jpegHeader);
    console.log('✅ Imagen de prueba creada');

    // Preparar FormData
    const formData = new FormData();
    
    // Datos básicos del residente
    formData.append('nombre', 'Maria');
    formData.append('apellidos', 'García Test');
    formData.append('fecha_nacimiento', '1985-06-15');
    formData.append('no_personas', '2');
    formData.append('no_des_per', '0');
    formData.append('recibo_apoyo', 'false');
    formData.append('no_apoyo', '0');
    formData.append('id_departamento', 'cmfbw9xey0002fafgexj98jy4');
    
    // Foto de perfil
    formData.append('profilePhoto', fs.createReadStream(testImagePath), {
      filename: 'perfil.jpg',
      contentType: 'image/jpeg'
    });

    console.log('📝 Datos del formulario preparados');
    console.log('👤 Enviando POST con archivos...');
    
    const createResponse = await axios.post(`${baseURL}/api/companeros`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ POST con archivos exitoso:', createResponse.status);
    console.log('📊 Respuesta:', JSON.stringify(createResponse.data, null, 2));

    // Limpiar
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🗑️ Archivo temporal eliminado');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Data:', error.response.data);
    }
    
    // Limpiar en caso de error
    const testImagePath = path.join(__dirname, 'test-profile-photo.jpg');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🗑️ Archivo temporal eliminado (cleanup)');
    }
  }
}

testWithFiles();
