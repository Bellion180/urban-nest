// Test simple usando curl para probar la actualización INVI
const { exec } = require('child_process');

const testData = {
  nombre: 'Test User',
  apellido: 'Test Apellido',
  email: 'test@test.com',
  telefono: '1234567890',
  edad: 30,
  noPersonas: 1,
  deudaActual: 0,
  pagosRealizados: 0,
  informe: 'Test informe',
  inviInfo: {
    idInvi: 'INVI-2024-TEST-002',
    mensualidades: '240 meses',
    deuda: 850000,
    fechaContrato: '2024-01-15',
    idCompanero: 'COMP-TEST-002'
  }
};

console.log('🔍 Iniciando prueba de actualización INVI...');
console.log('📊 Datos a enviar:', JSON.stringify(testData, null, 2));

// Primero obtener un residente
exec('curl -X GET http://localhost:3001/api/residents -H "Authorization: Bearer fake-token"', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error obteniendo residentes:', error);
    return;
  }
  
  try {
    const residents = JSON.parse(stdout);
    if (residents && residents.length > 0) {
      const testResident = residents[0];
      console.log(`✅ Residente encontrado: ${testResident.nombre} ${testResident.apellido} (ID: ${testResident.id})`);
      
      // Actualizar con datos INVI
      const updateData = { ...testData };
      const command = `curl -X PUT http://localhost:3001/api/residents/${testResident.id} -H "Content-Type: application/json" -H "Authorization: Bearer fake-token" -d '${JSON.stringify(updateData)}'`;
      
      console.log('📝 Enviando actualización...');
      exec(command, (updateError, updateStdout, updateStderr) => {
        if (updateError) {
          console.error('❌ Error en actualización:', updateError);
          return;
        }
        
        console.log('📄 Respuesta:', updateStdout);
        
        if (updateStderr) {
          console.error('⚠️ Stderr:', updateStderr);
        }
      });
    } else {
      console.log('❌ No hay residentes en la base de datos');
    }
  } catch (parseError) {
    console.error('❌ Error parseando respuesta:', parseError);
    console.log('Respuesta cruda:', stdout);
  }
});
