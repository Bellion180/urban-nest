const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findValidDepartment() {
  try {
    console.log('🔍 Buscando departamentos disponibles...');
    
    const departamentos = await prisma.departamentos.findMany({
      include: {
        torre: true,
        nivel: true
      }
    });

    console.log('📊 Departamentos encontrados:', departamentos.length);
    
    if (departamentos.length > 0) {
      const dept = departamentos[0];
      console.log('✅ Departamento válido encontrado:', {
        id: dept.id_departamento,
        nombre: dept.nombre,
        numero: dept.no_departamento,
        torre: dept.torre?.letra || 'N/A',
        nivel: dept.nivel?.numero || 'N/A'
      });
      return dept.id_departamento;
    } else {
      console.log('❌ No se encontraron departamentos');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  findValidDepartment();
}

module.exports = { findValidDepartment };
