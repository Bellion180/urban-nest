const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDepartment() {
  try {
    const dept = await prisma.departamentos.findFirst({
      include: {
        torre: true,
        nivel: true
      }
    });
    
    console.log('📋 Estructura del departamento:');
    console.log('- ID:', dept.id_departamento);
    console.log('- Número:', dept.no_departamento);
    console.log('- Nombre:', dept.nombre);
    console.log('- Torre:', dept.torre?.letra || 'Sin torre');
    console.log('- Nivel:', dept.nivel?.numero || 'Sin nivel');
    console.log('');
    console.log('📁 Ruta sugerida:');
    const torreId = dept.torre?.id_torre || 'sin-torre';
    const nivelNumero = dept.nivel?.numero || 1;
    const deptNumero = dept.no_departamento || dept.nombre;
    
    const rutaSugerida = `public/edificios/${torreId}/pisos/${nivelNumero}/departamentos/${deptNumero}`;
    console.log(rutaSugerida);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDepartment();
