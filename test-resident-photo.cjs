const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testResidentWithPhoto() {
  try {
    console.log('🧪 Iniciando prueba de registro de residente con foto...');

    const baseURL = 'http://localhost:3001';

    // 1. Primero hacer login para obtener token
    console.log('🔐 Haciendo login...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });

    if (!loginResponse.data.token) {
      throw new Error('Error en login: ' + JSON.stringify(loginResponse.data));
    }

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');

    // 2. Crear una imagen de prueba simple
    console.log('📸 Creando imagen de prueba...');
    const testImagePath = path.join(__dirname, 'test-profile-photo.jpg');
    
    // Crear un archivo de imagen simple (1x1 pixel JPEG)
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 
      0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 
      0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 
      0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12, 
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 
      0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20, 
      0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 
      0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 
      0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01, 
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 
      0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14, 
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00, 0x02, 
      0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xB2, 0xC0, 
      0x07, 0xFF, 0xD9
    ]);

    fs.writeFileSync(testImagePath, jpegHeader);
    console.log('✅ Imagen de prueba creada:', testImagePath);

    // 3. Usar departamento conocido (creado anteriormente)
    console.log('🏢 Usando departamento de prueba conocido...');
    const departamento = { id: 'cmfc47tak0004fagk5x833xq8' }; // Torre A, Apartamento 101
    
    console.log('✅ Departamento seleccionado:', {
      departamento: departamento.id,
      descripcion: 'Torre A, Apartamento 101'
    });

    // 4. Crear FormData con foto
    console.log('📋 Preparando datos del residente...');
    const formData = new FormData();
    
    // Datos del residente
    formData.append('nombre', 'Test');
    formData.append('apellidos', 'Foto Usuario');
    formData.append('fecha_nacimiento', '1990-01-01');
    formData.append('no_personas', '2');
    formData.append('no_des_per', '0');
    formData.append('recibo_apoyo', 'false');
    formData.append('id_departamento', departamento.id);
    
    // Agregar archivo de imagen
    formData.append('profilePhoto', fs.createReadStream(testImagePath), {
      filename: 'profile.jpg',
      contentType: 'image/jpeg'
    });

    // 5. Enviar petición
    console.log('🚀 Enviando registro de residente...');
    const createResponse = await axios.post(`${baseURL}/api/companeros`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Residente creado exitosamente!');
    console.log('📊 Respuesta:', JSON.stringify(createResponse.data, null, 2));

    // 6. Verificar que la foto se guardó correctamente
    const companero = createResponse.data.companero;
    if (companero.profilePhoto) {
      const photoPath = path.join(__dirname, 'public', companero.profilePhoto);
      if (fs.existsSync(photoPath)) {
        console.log('✅ Archivo de foto encontrado en:', photoPath);
        
        const stats = fs.statSync(photoPath);
        console.log('📏 Tamaño del archivo:', stats.size, 'bytes');
      } else {
        console.log('❌ Archivo de foto no encontrado en:', photoPath);
      }
    } else {
      console.log('❌ No se asignó profilePhoto al companero');
    }

    // 7. Obtener lista de companeros para verificar
    console.log('📋 Verificando lista de companeros...');
    const listResponse = await axios.get(`${baseURL}/api/companeros`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const testResident = listResponse.data.find(r => 
      r.nombre === 'Test' && r.apellido === 'Foto Usuario'
    );

    if (testResident) {
      console.log('✅ Residente encontrado en lista con foto:', testResident.profilePhoto);
    } else {
      console.log('❌ Residente no encontrado en lista');
    }

    // Limpiar archivo temporal
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🗑️ Archivo temporal eliminado');
    }

  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
    if (error.response) {
      console.error('📊 Respuesta del servidor:', error.response.status, error.response.data);
    }
    
    // Limpiar archivo temporal en caso de error
    const testImagePath = path.join(__dirname, 'test-profile-photo.jpg');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🗑️ Archivo temporal eliminado (cleanup)');
    }
  }
}

if (require.main === module) {
  testResidentWithPhoto();
}

module.exports = { testResidentWithPhoto };
