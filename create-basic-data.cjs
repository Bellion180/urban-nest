const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createBasicTestData() {
  try {
    console.log('🏗️ Creando datos básicos de prueba...');

    // 1. Crear torre
    const torre = await prisma.torres.create({
      data: {
        letra: 'A',
        descripcion: 'Torre de prueba A',
        imagen: '/edificios/torre-a.jpg'
      }
    });
    console.log('✅ Torre creada:', torre.letra);

    // 2. Crear nivel
    const nivel = await prisma.niveles.create({
      data: {
        nombre: 'Primer Piso',
        numero: 1,
        id_torre: torre.id_torre,
        imagen: `/edificios/${torre.id_torre}/pisos/1/piso.jpg`
      }
    });
    console.log('✅ Nivel creado:', nivel.nombre);

    // 3. Crear departamento
    const departamento = await prisma.departamentos.create({
      data: {
        no_departamento: '101',
        nombre: 'Apartamento 101',
        descripcion: 'Apartamento de prueba',
        id_torre: torre.id_torre,
        id_nivel: nivel.id_nivel
      }
    });
    console.log('✅ Departamento creado:', departamento.nombre);

    console.log('✅ Datos básicos creados exitosamente!');
    
    return {
      torre: torre.id_torre,
      nivel: nivel.id_nivel,
      departamento: departamento.id_departamento
    };

  } catch (error) {
    console.error('❌ Error creando datos básicos:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createBasicTestData();
}

module.exports = { createBasicTestData };
