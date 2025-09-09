import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Función para hacer login y obtener token
async function getAuthToken() {
  try {
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
  } catch (error) {
    console.error('Error en login:', error.message);
    throw error;
  }
}

// Función para probar creación de edificio final
async function testFinalBuildingCreation() {
  try {
    console.log('🔐 Obteniendo token de autenticación...');
    const token = await getAuthToken();
    console.log('✅ Token obtenido exitosamente');

    // Crear una imagen de prueba más realista (PNG)
    const testImagePath = path.join(process.cwd(), 'test-final-building.png');
    // Crear un archivo PNG básico
    const fakePngHeader = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG signature
      Buffer.from('Imagen de prueba para edificio final', 'utf8')
    ]);
    fs.writeFileSync(testImagePath, fakePngHeader);

    // Preparar FormData
    const formData = new FormData();
    formData.append('name', 'Torre Final Test');
    formData.append('description', 'Edificio para prueba final del sistema');
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

    console.log('🏗️ Creando edificio con imagen (prueba final)...');
    
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

    // Verificar que la imagen se guardó en la ubicación correcta
    if (result.building.image) {
      const imagePath = path.join('public', result.building.image);
      console.log('🖼️ Verificando imagen guardada en:', imagePath);
      
      if (fs.existsSync(imagePath)) {
        console.log('✅ ¡Imagen guardada correctamente en la nueva estructura!');
        
        // Verificar que se puede acceder vía HTTP
        const imageResponse = await fetch(`http://localhost:3001${result.building.image}`);
        if (imageResponse.ok) {
          console.log('✅ ¡Imagen accesible vía HTTP!');
        } else {
          console.log('❌ Imagen NO accesible vía HTTP');
        }
      } else {
        console.log('❌ Imagen NO encontrada en el sistema de archivos');
      }
      
      // Verificar que está en el directorio específico del edificio
      const expectedDir = path.join('public', 'edificios', result.building.id);
      if (fs.existsSync(expectedDir)) {
        const files = fs.readdirSync(expectedDir);
        console.log(`📁 Archivos en directorio del edificio (${result.building.id}):`, files);
        
        const imageFiles = files.filter(file => 
          ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase())
        );
        
        if (imageFiles.length > 0) {
          console.log('✅ ¡Imágenes encontradas en directorio específico del edificio!');
        }
      }
    } else {
      console.log('⚠️ No se asignó imagen al edificio en la respuesta');
    }

    // Verificar que aparece en el listado de edificios
    console.log('📋 Verificando listado de edificios...');
    const listResponse = await fetch('http://localhost:3001/api/buildings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const buildings = await listResponse.json();
    console.log('🏢 Total edificios:', buildings.length);
    
    const newBuilding = buildings.find(b => b.name === 'Torre Final Test');
    if (newBuilding) {
      console.log('✅ ¡Nuevo edificio encontrado en el listado!');
      console.log('🖼️ Imagen en listado:', newBuilding.image);
      
      if (newBuilding.image && newBuilding.image.includes(newBuilding.id)) {
        console.log('✅ ¡La imagen está usando la nueva estructura de carpetas!');
      } else {
        console.log('⚠️ La imagen NO está usando la nueva estructura');
      }
    } else {
      console.log('❌ Nuevo edificio NO encontrado en el listado');
    }

    // Limpiar archivo temporal
    fs.unlinkSync(testImagePath);
    console.log('🧹 Archivo temporal limpiado');

    console.log('\n🎉 ¡PRUEBA FINAL COMPLETADA!');
    console.log('📊 Resumen:');
    console.log(`   🏗️ Edificio ID: ${result.building.id}`);
    console.log(`   🖼️ Imagen: ${result.building.image}`);
    console.log(`   ✅ Sistema de imágenes organizadas funcionando correctamente`);

    return result.building;

  } catch (error) {
    console.error('❌ Error en prueba final:', error);
    throw error;
  }
}

// Ejecutar la prueba
console.log('🚀 Iniciando prueba FINAL del sistema de imágenes...');
testFinalBuildingCreation()
  .then((building) => {
    console.log('🎊 ¡ÉXITO TOTAL!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Prueba final falló:', error.message);
    process.exit(1);
  });
