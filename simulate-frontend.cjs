const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const baseURL = 'http://localhost:3001';

async function simulateFrontend() {
  try {
    console.log('🔐 Simulando login del frontend...');
    
    // Usar las credenciales que aparecen en el log
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@urbannest.com', // Como aparece en el log
      password: 'admin123'  // Asumiendo
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido');

    // Crear archivos de prueba
    console.log('📁 Creando archivos de prueba...');
    
    const testFiles = [
      { name: 'planta.jpg', path: path.join(__dirname, 'planta.jpg') },
      { name: 'Mapa mental kevin.pdf', path: path.join(__dirname, 'Mapa mental kevin.pdf') }
    ];

    // Crear imagen JPEG
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 
      0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 
      0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 
      0xD9 // Final del JPEG
    ]);
    fs.writeFileSync(testFiles[0].path, jpegHeader);

    // Crear PDF básico
    const pdfHeader = Buffer.from([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34,
      0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46, 0x0A
    ]);
    fs.writeFileSync(testFiles[1].path, pdfHeader);

    console.log('✅ Archivos de prueba creados');

    // Preparar FormData EXACTAMENTE como el frontend
    const formData = new FormData();
    
    // Simular datos del frontend (que enviaría el AddResident)
    formData.append('nombre', 'Juan Carlos');
    formData.append('apellidos', 'Test Frontend');
    formData.append('fecha_nacimiento', '1990-01-15');
    formData.append('no_personas', '2');
    formData.append('no_des_per', '0');
    formData.append('recibo_apoyo', 'false');
    formData.append('no_apoyo', '0');
    formData.append('id_departamento', 'cmfbw9xey0002fafgexj98jy4');
    
    // Foto de perfil (como planta.jpg en el log)
    formData.append('profilePhoto', fs.createReadStream(testFiles[0].path), {
      filename: 'planta.jpg',
      contentType: 'image/jpeg'
    });

    // Documentos (como en el log del frontend)
    formData.append('documents', fs.createReadStream(testFiles[1].path), {
      filename: 'Mapa mental kevin.pdf',
      contentType: 'application/pdf'
    });
    formData.append('documents', fs.createReadStream(testFiles[1].path), {
      filename: 'Mapa mental kevin.pdf',
      contentType: 'application/pdf'
    });
    formData.append('documents', fs.createReadStream(testFiles[1].path), {
      filename: 'Mapa mental kevin.pdf',
      contentType: 'application/pdf'
    });
    formData.append('documents', fs.createReadStream(testFiles[1].path), {
      filename: 'Mapa mental kevin.pdf',
      contentType: 'application/pdf'
    });

    console.log('📝 FormData preparado como el frontend');
    console.log('👤 Enviando POST simulando frontend...');

    const createResponse = await axios.post(`${baseURL}/api/companeros`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ POST exitoso:', createResponse.status);
    console.log('📊 Respuesta:', JSON.stringify(createResponse.data, null, 2));

    // Limpiar archivos
    testFiles.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    console.log('🗑️ Archivos temporales eliminados');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Data:', error.response.data);
    }
    
    // Limpiar en caso de error
    ['planta.jpg', 'Mapa mental kevin.pdf'].forEach(filename => {
      const filepath = path.join(__dirname, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    });
    console.log('🗑️ Archivos temporales eliminados (cleanup)');
  }
}

simulateFrontend();
