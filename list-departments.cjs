const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listDepartments() {
  try {
    console.log('🏢 Consultando departamentos disponibles...');

    const departamentos = await prisma.departamentos.findMany({
      include: {
        torre: true,
        nivel: true
      }
    });

    console.log('📋 Departamentos encontrados:');
    departamentos.forEach((dept, index) => {
      console.log(`${index + 1}. ID: ${dept.id_departamento}`);
      console.log(`   Número: ${dept.no_departamento}`);
      console.log(`   Nombre: ${dept.nombre}`);
      console.log(`   Torre: ${dept.torre?.letra || 'Sin torre'}`);
      console.log(`   Nivel: ${dept.nivel?.nombre || 'Sin nivel'} (${dept.nivel?.numero || 0})`);
      console.log('');
    });

    return departamentos;

  } catch (error) {
    console.error('❌ Error consultando departamentos:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  listDepartments();
}

module.exports = { listDepartments };
