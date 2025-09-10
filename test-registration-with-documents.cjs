const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const baseURL = 'http://localhost:3001';

async function testCompleteRegistrationWithDocuments() {
  console.log('🧪 Iniciando prueba completa de registro con documentos...');

  try {
    // 1. Login como admin
    console.log('🔐 Haciendo login como admin...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');

    // 2. Crear archivos de prueba
    console.log('📁 Creando archivos de prueba...');
    
    // Crear imagen JPEG de prueba para perfil
    const testImagePath = path.join(__dirname, 'test-profile-photo.jpg');
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 
      0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 
      0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 
      0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 
      0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 
      0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 
      0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12, 0x13, 
      0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 
      0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 
      0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 
      0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 
      0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32, 
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 
      0x00, 0x11, 0x08, 0x00, 0x01, 0x00, 0x01, 
      0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 
      0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14, 
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4, 0x00, 
      0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 
      0x00, 0x0C, 0x03, 0x01, 0x00, 0x02, 0x11, 
      0x03, 0x11, 0x00, 0x3F, 0x00, 0xB2, 0xC0, 
      0x07, 0xFF, 0xD9
    ]);

    fs.writeFileSync(testImagePath, jpegHeader);
    console.log('✅ Imagen de prueba creada');

    // Crear PDFs de prueba
    const testDocs = [
      { name: 'test-ine.pdf', path: path.join(__dirname, 'test-ine.pdf') },
      { name: 'test-curp.pdf', path: path.join(__dirname, 'test-curp.pdf') },
      { name: 'test-comprobante.pdf', path: path.join(__dirname, 'test-comprobante.pdf') }
    ];

    // PDF mínimo válido
    const pdfHeader = Buffer.from([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, // %PDF-1.4
      0x0A, 0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, // \n1 0 obj
      0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, // <</Type/
      0x43, 0x61, 0x74, 0x61, 0x6C, 0x6F, 0x67, 0x2F, // Catalog/
      0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20, // Pages 2 
      0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A, 0x65, 0x6E, // 0 R>>\nen
      0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x78, 0x72, 0x65, // dobj\nxre
      0x66, 0x0A, 0x30, 0x20, 0x33, 0x0A, 0x30, 0x30, // f\n0 3\n00
      0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, // 00000000
      0x20, 0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, //  65535 f
      0x20, 0x0A, 0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, //  \ntraile
      0x72, 0x3C, 0x3C, 0x2F, 0x53, 0x69, 0x7A, 0x65, // r<</Size
      0x20, 0x33, 0x2F, 0x52, 0x6F, 0x6F, 0x74, 0x20, //  3/Root 
      0x31, 0x20, 0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A, // 1 0 R>>\n
      0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, // startxre
      0x66, 0x0A, 0x31, 0x30, 0x39, 0x0A, 0x25, 0x25, // f\n109\n%%
      0x45, 0x4F, 0x46                                // EOF
    ]);

    testDocs.forEach(doc => {
      fs.writeFileSync(doc.path, pdfHeader);
      console.log(`✅ PDF de prueba creado: ${doc.name}`);
    });

    // 3. Preparar datos del residente
    const formData = new FormData();
    
    // Datos básicos del residente
    formData.append('nombre', 'María Elena');
    formData.append('apellidos', 'González López');
    formData.append('fecha_nacimiento', '1985-06-15');
    formData.append('no_personas', '3');
    formData.append('no_des_per', '0');
    formData.append('recibo_apoyo', 'false');
    formData.append('no_apoyo', '0');
    formData.append('id_departamento', 'clvbmjz870007fz9mdc2psngv'); // ID del departamento de prueba
    
    // Foto de perfil
    formData.append('profilePhoto', fs.createReadStream(testImagePath), {
      filename: 'perfil.jpg',
      contentType: 'image/jpeg'
    });

    // Documentos
    testDocs.forEach(doc => {
      formData.append('documents', fs.createReadStream(doc.path), {
        filename: doc.name,
        contentType: 'application/pdf'
      });
    });

    console.log('📝 Datos del formulario preparados');

    // 4. Crear el residente
    console.log('👤 Creando residente con foto y documentos...');
    const createResponse = await axios.post(`${baseURL}/api/companeros`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ ¡Residente creado exitosamente!');
    console.log('📊 Respuesta del servidor:', JSON.stringify(createResponse.data, null, 2));

    // 5. Verificar archivos guardados
    const companero = createResponse.data.companero;
    
    // Verificar foto de perfil
    if (companero.profilePhoto) {
      const photoPath = path.join(__dirname, 'public', companero.profilePhoto);
      console.log('🔍 Verificando foto en:', photoPath);
      
      if (fs.existsSync(photoPath)) {
        const stats = fs.statSync(photoPath);
        console.log('✅ Foto guardada correctamente:', {
          path: companero.profilePhoto,
          size: stats.size + ' bytes'
        });
      } else {
        console.error('❌ Foto no encontrada en el path esperado');
      }
    }

    // Verificar documentos
    if (companero.documentos && companero.documentos.length > 0) {
      console.log('📄 Verificando documentos guardados...');
      companero.documentos.forEach((docPath, index) => {
        const fullPath = path.join(__dirname, 'public', docPath);
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          console.log(`✅ Documento ${index + 1} guardado:`, {
            path: docPath,
            size: stats.size + ' bytes'
          });
        } else {
          console.error(`❌ Documento ${index + 1} no encontrado:`, docPath);
        }
      });
    } else {
      console.log('ℹ️ No se guardaron documentos en la respuesta');
    }

    // 6. Verificar estructura de carpetas
    const deptPath = path.dirname(path.join(__dirname, 'public', companero.profilePhoto || '/edificios/test/pisos/1/departamentos/101'));
    console.log('🗂️ Verificando estructura de carpeta del departamento:', deptPath);
    
    if (fs.existsSync(deptPath)) {
      const files = fs.readdirSync(deptPath);
      console.log('📁 Archivos en la carpeta del departamento:', files);
    }

    // Limpiar archivos temporales
    [testImagePath, ...testDocs.map(d => d.path)].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Archivo temporal eliminado:', path.basename(filePath));
      }
    });

    console.log('✅ ¡Prueba completa exitosa! ✅');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.response) {
      console.error('📊 Respuesta del servidor:', error.response.status, error.response.data);
    }
    
    // Limpiar archivos temporales en caso de error
    const cleanupFiles = [
      'test-profile-photo.jpg',
      'test-ine.pdf',
      'test-curp.pdf',
      'test-comprobante.pdf'
    ].map(name => path.join(__dirname, name));
    
    cleanupFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Archivo temporal eliminado (cleanup):', path.basename(filePath));
      }
    });
  }
}

if (require.main === module) {
  testCompleteRegistrationWithDocuments();
}

module.exports = { testCompleteRegistrationWithDocuments };
