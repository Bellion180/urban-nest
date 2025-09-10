const fetch = require('node-fetch');

async function testDepartmentsEndpoint() {
  try {
    console.log('🧪 Probando endpoint de departamentos...');
    
    const response = await fetch('http://localhost:3001/api/companeros/departments', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZidzgzMXYwMDAwZmEzZ3c1dTZjMnBuIiwiZW1haWwiOiJhZG1pbkB1cmJhbm5lc3QuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzU3NDY0MjE2LCJleHAiOjE3NTc1NTA2MTZ9.iK4QxRmrfHEqhJVHDX6vkNX26Ii0Sf6LDIhYK4xi-Oo'
      }
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', errorText);
      return;
    }
    
    const departments = await response.json();
    console.log('✅ Departamentos obtenidos:', departments.length);
    
    if (departments.length > 0) {
      console.log('\n📋 Primeros 5 departamentos:');
      departments.slice(0, 5).forEach((dept, index) => {
        console.log(`  ${index + 1}. ID: ${dept.id}`);
        console.log(`     Número: ${dept.number}`);
        console.log(`     Nombre: ${dept.name}`);
        console.log(`     Torre: ${dept.tower.name || 'N/A'}`);
        console.log(`     Nivel: ${dept.level.number || 'N/A'}`);
        console.log();
      });
      
      // Probar con el primer departamento para el registro de residente
      console.log('✅ Primer departamento para usar en registro:');
      console.log(`   ID: ${departments[0].id}`);
      console.log(`   Descripción: Depto ${departments[0].number} - ${departments[0].tower.name || 'Torre'} - Nivel ${departments[0].level.number || 'N/A'}`);
    } else {
      console.log('❌ No se encontraron departamentos');
    }
    
  } catch (error) {
    console.error('❌ Error al probar endpoint:', error);
  }
}

testDepartmentsEndpoint();
