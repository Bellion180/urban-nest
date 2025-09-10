const fetch = require('node-fetch');

async function testNewDepartmentsEndpoint() {
  try {
    console.log('🧪 Probando nuevo endpoint de departamentos jerarquico...');
    
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
    
    const towers = await response.json();
    console.log('✅ Torres obtenidas:', towers.length);
    
    if (towers.length > 0) {
      console.log('\n📋 Estructura completa:');
      towers.forEach((tower, towerIndex) => {
        console.log(`🏢 ${towerIndex + 1}. Torre: ${tower.name} (${tower.letter})`);
        console.log(`   ID: ${tower.id}`);
        console.log(`   Niveles: ${tower.levels.length}`);
        
        tower.levels.forEach((level, levelIndex) => {
          console.log(`   📚 Nivel ${levelIndex + 1}: ${level.name} (Num: ${level.number})`);
          console.log(`      ID: ${level.id}`);
          console.log(`      Departamentos: ${level.departments.length}`);
          
          level.departments.forEach((dept, deptIndex) => {
            console.log(`      🏠 Depto ${deptIndex + 1}: ${dept.number} (${dept.name})`);
            console.log(`         ID: ${dept.id}`);
          });
        });
        console.log();
      });
      
      // Buscar el primer departamento para usar en tests
      const firstTowerWithDepts = towers.find(t => 
        t.levels.some(l => l.departments.length > 0)
      );
      
      if (firstTowerWithDepts) {
        const firstLevelWithDepts = firstTowerWithDepts.levels.find(l => l.departments.length > 0);
        const firstDept = firstLevelWithDepts.departments[0];
        
        console.log('✅ Primer departamento para usar en pruebas:');
        console.log(`   Torre: ${firstTowerWithDepts.name} (ID: ${firstTowerWithDepts.id})`);
        console.log(`   Nivel: ${firstLevelWithDepts.name} (ID: ${firstLevelWithDepts.id})`);
        console.log(`   Departamento: ${firstDept.number} (ID: ${firstDept.id})`);
        console.log(`   Para frontend: "${firstTowerWithDepts.name} - Nivel ${firstLevelWithDepts.number} - Depto ${firstDept.number}"`);
      }
    } else {
      console.log('❌ No se encontraron torres con departamentos');
    }
    
  } catch (error) {
    console.error('❌ Error al probar endpoint:', error);
  }
}

testNewDepartmentsEndpoint();
