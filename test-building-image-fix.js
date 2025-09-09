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

// Función para probar creación de edificio con imagen
async function testBuildingCreationWithImage() {
  try {
    console.log('🔐 Obteniendo token de autenticación...');
    const token = await getAuthToken();
    console.log('✅ Token obtenido exitosamente');

    // Crear una imagen de prueba simple
    const testImagePath = path.join(process.cwd(), 'test-building-image.txt');
    fs.writeFileSync(testImagePath, 'Imagen de prueba para edificio nuevo');

    // Preparar FormData
    const formData = new FormData();
    formData.append('name', 'Torre Prueba Imagen');
    formData.append('description', 'Edificio creado para probar imágenes');
    formData.append('floors', JSON.stringify([
      {
        name: 'Piso 1',
        number: 1,
        apartments: ['101', '102']
      },
      {
        name: 'Piso 2',
        number: 2,
        apartments: ['201', '202']
      }
    ]));
    
    // Agregar imagen
    formData.append('image', fs.createReadStream(testImagePath));

    console.log('🏗️ Creando edificio con imagen...');
    
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

    // Verificar que la imagen se guardó correctamente
    if (result.building.image) {
      const imagePath = path.join('public', result.building.image);
      console.log('🖼️ Verificando imagen guardada en:', imagePath);
      
      if (fs.existsSync(imagePath)) {
        console.log('✅ Imagen guardada correctamente');
        
        // Verificar que se puede acceder vía HTTP
        const imageResponse = await fetch(`http://localhost:3001${result.building.image}`);
        if (imageResponse.ok) {
          console.log('✅ Imagen accesible vía HTTP');
        } else {
          console.log('❌ Imagen NO accesible vía HTTP');
        }
      } else {
        console.log('❌ Imagen NO encontrada en el sistema de archivos');
      }
    } else {
      console.log('⚠️ No se asignó imagen al edificio');
    }

    // Verificar que aparece en el listado de edificios
    console.log('📋 Verificando listado de edificios...');
    const listResponse = await fetch('http://localhost:3001/api/buildings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const buildings = await listResponse.json();
    console.log('🏢 Edificios encontrados:', buildings.length);
    
    const newBuilding = buildings.find(b => b.name === 'Torre Prueba Imagen');
    if (newBuilding) {
      console.log('✅ Nuevo edificio encontrado en el listado');
      console.log('🖼️ Imagen en listado:', newBuilding.image);
    } else {
      console.log('❌ Nuevo edificio NO encontrado en el listado');
    }

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
console.log('🚀 Iniciando prueba de creación de edificio con imagen...');
testBuildingCreationWithImage()
  .then((building) => {
    console.log('🎉 Prueba completada exitosamente!');
    console.log('🏗️ Edificio ID:', building.id);
    console.log('🖼️ Imagen final:', building.image);
  })
  .catch((error) => {
    console.error('💥 Prueba falló:', error);
    process.exit(1);
  });
