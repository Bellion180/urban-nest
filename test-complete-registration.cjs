const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testCompleteRegistration() {
  try {
    console.log('🧪 === PRUEBA COMPLETA DE REGISTRO DE RESIDENTE ===');

    const baseURL = 'http://localhost:3001';

    // 1. Login
    console.log('🔐 Paso 1: Autenticación...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });

    if (!loginResponse.data.token) {
      throw new Error('No se obtuvo token de autenticación');
    }

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');

    // 2. Obtener departamentos disponibles
    console.log('🏢 Paso 2: Consultando departamentos disponibles...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const departamentos = await prisma.departamentos.findMany({
      include: {
        torre: true,
        nivel: true
      },
      take: 1 // Solo necesitamos uno para la prueba
    });

    if (departamentos.length === 0) {
      throw new Error('No hay departamentos disponibles');
    }

    const departamento = departamentos[0];
    console.log('✅ Departamento seleccionado:', {
      id: departamento.id_departamento,
      numero: departamento.no_departamento,
      torre: departamento.torre?.letra || 'Sin torre',
      nivel: departamento.nivel?.numero || 'Sin nivel'
    });

    await prisma.$disconnect();

    // 3. Crear imagen de prueba
    console.log('📸 Paso 3: Creando imagen de prueba...');
    const testImagePath = path.join(__dirname, 'test-profile-photo.jpg');
    
    // Crear un archivo JPEG mínimo válido
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
    console.log('✅ Imagen de prueba creada');

    // 4. Preparar FormData
    console.log('📋 Paso 4: Preparando datos del residente...');
    const formData = new FormData();
    
    // Datos del residente según el modelo Companeros
    formData.append('nombre', 'Juan');
    formData.append('apellidos', 'Pérez García');
    formData.append('fecha_nacimiento', '1990-01-15');
    formData.append('no_personas', '3');
    formData.append('no_des_per', '0');
    formData.append('recibo_apoyo', 'false');
    formData.append('no_apoyo', '0');
    formData.append('id_departamento', departamento.id_departamento);
    
    // Agregar foto
    formData.append('profilePhoto', fs.createReadStream(testImagePath), {
      filename: 'profile.jpg',
      contentType: 'image/jpeg'
    });

    console.log('✅ FormData preparado');

    // 5. Enviar registro
    console.log('🚀 Paso 5: Enviando registro al servidor...');
    const createResponse = await axios.post(`${baseURL}/api/companeros`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ ¡Residente creado exitosamente!');
    console.log('📊 Respuesta del servidor:', JSON.stringify(createResponse.data, null, 2));

    // 6. Verificar que la foto se guardó correctamente
    const companero = createResponse.data.companero;
    if (companero.profilePhoto) {
      const expectedPath = path.join(__dirname, 'public', companero.profilePhoto);
      console.log('🔍 Verificando foto en:', expectedPath);
      
      if (fs.existsSync(expectedPath)) {
        const stats = fs.statSync(expectedPath);
        console.log('✅ Foto guardada correctamente:', {
          path: companero.profilePhoto,
          size: stats.size + ' bytes'
        });
      } else {
        console.log('❌ Archivo de foto no encontrado en:', expectedPath);
      }
    } else {
      console.log('⚠️ No se asignó profilePhoto al companero');
    }

    // 7. Verificar estructura de carpetas
    if (companero.profilePhoto) {
      const urlParts = companero.profilePhoto.split('/');
      console.log('📁 Estructura de la URL:', {
        edificios: urlParts[1],
        torreId: urlParts[2],
        pisos: urlParts[3],
        nivelNumero: urlParts[4],
        departamentos: urlParts[5],
        deptNumero: urlParts[6],
        archivo: urlParts[7]
      });
    }

    // Limpiar archivo temporal
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🗑️ Archivo temporal eliminado');
    }

    console.log('🎉 ¡PRUEBA COMPLETA EXITOSA!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
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
  testCompleteRegistration();
}

module.exports = { testCompleteRegistration };
