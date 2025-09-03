import fetch from 'node-fetch';

async function testFloorImages() {
  try {
    // 1. Login para obtener token
    console.log('1. Intentando login...');
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
    
    const loginData = await loginResponse.json();
    console.log('Login exitoso:', loginData.message);
    const token = loginData.token;
    
    // 2. Obtener imágenes de pisos
    console.log('\n2. Obteniendo imágenes de pisos...');
    const buildingId = 'cmf3b0w2l0000fa48tsj3nl80';
    const floorImagesResponse = await fetch(`http://localhost:3001/api/buildings/${buildingId}/pisos/imagenes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    const floorImagesData = await floorImagesResponse.json();
    console.log('Imágenes de pisos:', JSON.stringify(floorImagesData, null, 2));
    
    // 3. Verificar que las URLs sean accesibles
    console.log('\n3. Verificando acceso a imágenes...');
    for (const floorImg of floorImagesData.floorImages) {
      const imageUrl = `http://localhost:3001${floorImg.imageUrl}`;
      console.log(`Verificando: ${imageUrl}`);
      
      const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
      console.log(`  - Status: ${imageResponse.status} ${imageResponse.statusText}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFloorImages();
