const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDepartments() {
  try {
    console.log('🔍 Verificando estructura completa de departamentos...\n');
    
    // 1. Verificar todos los departamentos existentes
    const allDepartments = await prisma.departamento.findMany({
      select: {
        id: true,
        numero: true,
        nivel: {
          select: {
            numero: true,
            torre: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      }
    });
    
    console.log(`📊 Total de departamentos encontrados: ${allDepartments.length}\n`);
    
    if (allDepartments.length === 0) {
      console.log('❌ No hay departamentos en la base de datos');
      return;
    }
    
    // Agrupar por torre
    const departmentsByTorre = {};
    
    allDepartments.forEach(dept => {
      const torreId = dept.nivel?.torre?.id || 'SIN_TORRE';
      const torreNombre = dept.nivel?.torre?.nombre || 'SIN TORRE';
      
      if (!departmentsByTorre[torreId]) {
        departmentsByTorre[torreId] = {
          nombre: torreNombre,
          departamentos: []
        };
      }
      
      departmentsByTorre[torreId].departamentos.push({
        id: dept.id,
        numero: dept.numero,
        nivel: dept.nivel?.numero || 'SIN NIVEL'
      });
    });
    
    // Mostrar información por torre
    for (const [torreId, info] of Object.entries(departmentsByTorre)) {
      console.log(`🏢 Torre: ${info.nombre} (ID: ${torreId})`);
      console.log(`   Departamentos: ${info.departamentos.length}`);
      
      info.departamentos.forEach(dept => {
        console.log(`   - Depto ${dept.numero} | Nivel ${dept.nivel} | ID: ${dept.id}`);
      });
      console.log();
    }
    
    // Buscar específicamente el departamento 101 que está enviando el frontend
    console.log('🔍 Buscando departamento con número "101"...');
    const dept101 = allDepartments.find(d => d.numero === '101');
    
    if (dept101) {
      console.log(`✅ Departamento 101 encontrado:`);
      console.log(`   ID: ${dept101.id}`);
      console.log(`   Número: ${dept101.numero}`);
      console.log(`   Torre: ${dept101.nivel?.torre?.nombre || 'SIN TORRE'}`);
      console.log(`   Nivel: ${dept101.nivel?.numero || 'SIN NIVEL'}`);
    } else {
      console.log(`❌ Departamento 101 NO existe`);
      console.log(`💡 Departamentos disponibles: ${allDepartments.map(d => d.numero).join(', ')}`);
    }
    
    console.log('\n📋 Lista de IDs de departamentos válidos:');
    allDepartments.forEach(dept => {
      console.log(`   ${dept.id} -> Depto ${dept.numero} (Torre: ${dept.nivel?.torre?.nombre || 'SIN TORRE'})`);
    });
    
  } catch (error) {
    console.error('❌ Error al verificar departamentos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDepartments();
