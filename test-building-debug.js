import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Función para hacer login y obtener token
async function getAuthToken() {
  const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@urbannest.com',
      password: 'admin123'
    })
  });

  if (!loginResponse.ok) {
    throw new Error('Login failed');
  }

  const loginData = await loginResponse.json();
  return loginData.token;
}

// Función para probar creación de edificio con imagen (con logs)
async function testBuildingCreationWithLogs() {
  try {
    console.log('🔐 Obteniendo token de autenticación...');
    const token = await getAuthToken();
    console.log('✅ Token obtenido exitosamente');

    // Crear una imagen de prueba real (JPG)
    const testImagePath = path.join(process.cwd(), 'test-building-debug.jpg');
    // Crear un archivo binario más realista
    const fakeJpgHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01
    ]);
    fs.writeFileSync(testImagePath, fakeJpgHeader);

    // Preparar FormData
    const formData = new FormData();
    formData.append('name', 'Torre Debug Logs');
    formData.append('description', 'Edificio para ver logs de debug');
    formData.append('floors', JSON.stringify([
      {
        name: 'Piso 1',
        number: 1,
        apartments: ['101']
      }
    ]));
    
    // Agregar imagen
    formData.append('image', fs.createReadStream(testImagePath));

    console.log('🏗️ Creando edificio con imagen (debug)...');
    
    const response = await fetch('http://localhost:3001/api/buildings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const responseText = await response.text();
    console.log('📝 Respuesta del servidor:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log('✅ Edificio creado exitosamente:', result.building);

    // Limpiar archivo temporal
    fs.unlinkSync(testImagePath);
    console.log('🧹 Archivo temporal limpiado');

    return result.building;

  } catch (error) {
    console.error('❌ Error en prueba:', error);
    throw error;
  }
}

// Ejecutar la prueba
console.log('🚀 Iniciando prueba con logs de debug...');
testBuildingCreationWithLogs()
  .then((building) => {
    console.log('🎉 Prueba completada exitosamente!');
    console.log('🏗️ Edificio ID:', building.id);
    console.log('🖼️ Imagen final:', building.image);
  })
  .catch((error) => {
    console.error('💥 Prueba falló:', error);
    process.exit(1);
  });
