const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Validando APIs del frontend...\n');

  try {
    // 1. Test login
    console.log('🔐 Probando login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso');
    
    const token = loginData.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Test obtener compañeros (residents)
    console.log('\n👥 Probando obtener residents/compañeros...');
    const residentsResponse = await fetch(`${API_BASE}/residents`, { headers });
    
    if (!residentsResponse.ok) {
      throw new Error(`Get residents failed: ${residentsResponse.status}`);
    }
    
    const residents = await residentsResponse.json();
    console.log(`✅ Obtenidos ${residents.length} compañeros`);
    residents.forEach(r => {
      console.log(`   - ${r.nombre} ${r.apellidos} (Depto: ${r.departamento?.numero})`);
    });

    // 3. Test obtener buildings/torres
    console.log('\n🏢 Probando obtener buildings/torres...');
    const buildingsResponse = await fetch(`${API_BASE}/buildings`, { headers });
    
    if (!buildingsResponse.ok) {
      throw new Error(`Get buildings failed: ${buildingsResponse.status}`);
    }
    
    const buildings = await buildingsResponse.json();
    console.log(`✅ Obtenidas ${buildings.length} torres`);
    buildings.forEach(b => {
      console.log(`   - ${b.nombre} (${b.departamentos?.length || 0} departamentos)`);
    });

    // 4. Test crear resident/compañero
    console.log('\n➕ Probando crear nuevo compañero...');
    const primerDepartamento = buildings[0]?.departamentos?.[0];
    
    if (primerDepartamento) {
      const newResident = {
        nombre: 'Test Frontend',
        apellidos: 'Usuario Prueba',
        fecha_nacimiento: '1995-06-15',
        no_personas: 3,
        no_des_per: 0,
        recibo_apoyo: 'NO',
        no_apoyo: 0,
        buildingId: buildings[0].id_torre,
        floorId: primerDepartamento.id_departamento, // En el nuevo modelo no hay floors separados
        apartmentId: primerDepartamento.id_departamento
      };

      const createResponse = await fetch(`${API_BASE}/residents`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newResident)
      });

      if (createResponse.ok) {
        const created = await createResponse.json();
        console.log('✅ Compañero creado exitosamente:', created.nombre);
        
        // 5. Test actualizar resident/compañero
        console.log('\n✏️ Probando actualizar compañero...');
        const updateData = {
          nombre: 'Test Frontend Updated',
          apellidos: 'Usuario Actualizado',
          no_personas: 4
        };

        const updateResponse = await fetch(`${API_BASE}/residents/${created.id_companero}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
          console.log('✅ Compañero actualizado exitosamente');
        } else {
          console.log('❌ Error actualizando compañero:', updateResponse.status);
        }

        // 6. Test eliminar resident/compañero
        console.log('\n🗑️ Probando eliminar compañero...');
        const deleteResponse = await fetch(`${API_BASE}/residents/${created.id_companero}`, {
          method: 'DELETE',
          headers
        });

        if (deleteResponse.ok) {
          console.log('✅ Compañero eliminado exitosamente');
        } else {
          console.log('❌ Error eliminando compañero:', deleteResponse.status);
        }
      } else {
        console.log('❌ Error creando compañero:', createResponse.status);
        const errorText = await createResponse.text();
        console.log('Error details:', errorText);
      }
    } else {
      console.log('❌ No se encontró departamento para crear compañero');
    }

    console.log('\n🎉 Validación de APIs completada!');
    
  } catch (error) {
    console.error('❌ Error en validación:', error.message);
  }
}

// Si el usuario cancela con discapacidad, no_des_per debe ser 0
async function testDisabilityLogic() {
  console.log('\n🦽 Probando lógica de discapacidad...');
  
  try {
    // Login primero
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const headers = {
      'Authorization': `Bearer ${loginData.token}`,
      'Content-Type': 'application/json'
    };

    // Obtener buildings para tener un departamento
    const buildingsResponse = await fetch(`${API_BASE}/buildings`, { headers });
    const buildings = await buildingsResponse.json();
    const primerDepartamento = buildings[0]?.departamentos?.[0];

    if (primerDepartamento) {
      // Test 1: Sin discapacidad
      const residentSinDiscapacidad = {
        nombre: 'Sin',
        apellidos: 'Discapacidad',
        fecha_nacimiento: '1990-01-01',
        no_personas: 2,
        tieneDiscapacidad: false,
        no_des_per: 5, // Este valor debería ser ignorado
        buildingId: buildings[0].id_torre,
        apartmentId: primerDepartamento.id_departamento
      };

      const response1 = await fetch(`${API_BASE}/residents`, {
        method: 'POST',
        headers,
        body: JSON.stringify(residentSinDiscapacidad)
      });

      if (response1.ok) {
        const created1 = await response1.json();
        console.log(`✅ Sin discapacidad - no_des_per guardado como: ${created1.no_des_per} (esperado: 0)`);
        
        // Limpiar
        await fetch(`${API_BASE}/residents/${created1.id_companero}`, {
          method: 'DELETE',
          headers
        });
      }

      // Test 2: Con discapacidad
      const residentConDiscapacidad = {
        nombre: 'Con',
        apellidos: 'Discapacidad',
        fecha_nacimiento: '1990-01-01',
        no_personas: 3,
        tieneDiscapacidad: true,
        no_des_per: 2,
        buildingId: buildings[0].id_torre,
        apartmentId: primerDepartamento.id_departamento
      };

      const response2 = await fetch(`${API_BASE}/residents`, {
        method: 'POST',
        headers,
        body: JSON.stringify(residentConDiscapacidad)
      });

      if (response2.ok) {
        const created2 = await response2.json();
        console.log(`✅ Con discapacidad - no_des_per guardado como: ${created2.no_des_per} (esperado: 2)`);
        
        // Limpiar
        await fetch(`${API_API}/residents/${created2.id_companero}`, {
          method: 'DELETE',
          headers
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error en test de discapacidad:', error.message);
  }
}

async function main() {
  await testAPI();
  await testDisabilityLogic();
}

main();
