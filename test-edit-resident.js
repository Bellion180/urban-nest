const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test para actualizar información de residente
async function testEditResident() {
  try {
    console.log('🧪 Iniciando test de edición de residente...');
    
    // 1. Primero obtenemos la lista de residentes
    const residentsResponse = await axios.get(`${API_BASE}/residents`);
    const residents = residentsResponse.data;
    
    if (residents.length === 0) {
      console.log('❌ No hay residentes para editar');
      return;
    }
    
    const resident = residents[0];
    console.log('📋 Residente original:', JSON.stringify(resident, null, 2));
    
    // 2. Preparamos datos de prueba para la actualización
    const updateData = {
      // Información personal
      nombre: 'Juan Carlos (Editado)',
      apellido: 'Pérez Modificado',
      cedula: resident.cedula, // Mantenemos la cédula original
      telefono: '0424-999-8888',
      email: 'juan.editado@ejemplo.com',
      fechaNacimiento: '1985-05-15',
      genero: 'MASCULINO',
      noPersonas: 3,
      discapacidad: 'NO',
      
      // Información financiera
      estrato: 4,
      ingresos: 2500.00,
      
      // Información INVI
      subsidio: 'SI',
      montoSubsidio: 15000.00,
      fechaVencimiento: '2025-12-31',
      
      // Información de vivienda
      apartamento: resident.apartamento,
      piso: resident.piso,
      buildingId: resident.buildingId
    };
    
    console.log('📝 Datos de actualización:', JSON.stringify(updateData, null, 2));
    
    // 3. Realizamos la actualización
    const response = await axios.put(`${API_BASE}/residents/${resident.id}`, updateData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Actualización exitosa:', response.status);
    console.log('📊 Datos actualizados:', JSON.stringify(response.data, null, 2));
    
    // 4. Verificamos que los cambios se guardaron
    const verifyResponse = await axios.get(`${API_BASE}/residents`);
    const updatedResident = verifyResponse.data.find(r => r.id === resident.id);
    
    console.log('🔍 Verificación - Residente actualizado:', JSON.stringify(updatedResident, null, 2));
    
    // Verificar algunos campos específicos
    if (updatedResident.nombre === updateData.nombre) {
      console.log('✅ Nombre actualizado correctamente');
    } else {
      console.log('❌ Error: Nombre no se actualizó');
    }
    
    if (updatedResident.telefono === updateData.telefono) {
      console.log('✅ Teléfono actualizado correctamente');
    } else {
      console.log('❌ Error: Teléfono no se actualizó');
    }
    
    if (updatedResident.ingresos === updateData.ingresos) {
      console.log('✅ Ingresos actualizados correctamente');
    } else {
      console.log('❌ Error: Ingresos no se actualizaron');
    }
    
    console.log('🎉 Test completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en el test:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Ejecutar el test
testEditResident();
