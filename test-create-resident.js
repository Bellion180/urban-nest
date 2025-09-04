import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function testCreateResident() {
  try {
    // 0. Verificar si el servidor está corriendo
    console.log('0. Verificando servidor...');
    try {
      const healthResponse = await fetch('http://localhost:3001/api/health');
      if (!healthResponse.ok) {
        throw new Error('Servidor no disponible');
      }
      console.log('✅ Servidor disponible');
    } catch (error) {
      console.error('❌ Error: El servidor no está corriendo.');
      console.error('Ejecuta: npm run server');
      return;
    }
    
    // 1. Login para obtener token
    console.log('\n1. Intentando login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('Login exitoso:', loginData.message);
    const token = loginData.token;
    
    // 2. Obtener edificios para usar uno real
    console.log('\n2. Obteniendo edificios...');
    const buildingsResponse = await fetch('http://localhost:3001/api/buildings', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    const buildings = await buildingsResponse.json();
    console.log('Edificios disponibles:', buildings.length);
    
    if (buildings.length === 0) {
      console.log('No hay edificios disponibles para probar');
      return;
    }
    
    const testBuilding = buildings[0];
    console.log('Usando edificio:', testBuilding.name, testBuilding.id);
    
    // 3. Crear FormData para el residente
    console.log('\n3. Creando residente de prueba...');
    const formData = new FormData();
    
    formData.append('nombre', 'Juan');
    formData.append('apellido', 'Pérez');
    formData.append('email', 'juan.perez@test.com');
    formData.append('telefono', '5551234567');
    formData.append('fechaNacimiento', '1990-01-01');
    formData.append('profesion', 'Ingeniero');
    formData.append('estadoCivil', 'SOLTERO');
    formData.append('numeroEmergencia', '5559876543');
    formData.append('buildingId', testBuilding.id);
    formData.append('apartmentNumber', testBuilding.floors[0].apartments[0]);
    formData.append('floorNumber', '1');
    
    // Crear una imagen de prueba simple (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xCC, 0x2E, 0x34, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    formData.append('profilePhoto', testImageBuffer, {
      filename: 'test-profile.png',
      contentType: 'image/png'
    });
    
    // 4. Enviar petición para crear residente
    const createResponse = await fetch('http://localhost:3001/api/residents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    const createResult = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('Residente creado exitosamente:', createResult.message);
      console.log('ID del residente:', createResult.resident.id);
      console.log('Foto de perfil:', createResult.resident.profilePhoto);
      
      // 5. Verificar que la imagen se guardó
      if (createResult.resident.profilePhoto) {
        const imageUrl = `http://localhost:3001${createResult.resident.profilePhoto}`;
        console.log('\n5. Verificando acceso a la imagen:', imageUrl);
        
        const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
        console.log('Estado de la imagen:', imageResponse.status, imageResponse.statusText);
      }
    } else {
      console.error('Error al crear residente:', createResult.error);
    }
    
  } catch (error) {
    console.error('Error durante la prueba:', error.message);
  }
}

testCreateResident();
