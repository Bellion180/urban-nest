// Script para crear datos de prueba completos con residentes en niveles
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
  console.log('🏗️ Creando datos de prueba completos...');

  try {
    // 1. Crear torre de prueba
    const torre = await prisma.torres.upsert({
      where: { letra: 'A' },
      update: {},
      create: {
        letra: 'A',
        nivel: 'Torre A'
      }
    });
    console.log(`✅ Torre creada: ${torre.letra}`);

    // 2. Crear niveles
    const nivel1 = await prisma.niveles.upsert({
      where: { 
        id_torre_numero: {
          id_torre: torre.id_torre,
          numero: 1
        }
      },
      update: {},
      create: {
        numero: 1,
        nombre: 'Planta Baja',
        id_torre: torre.id_torre
      }
    });

    const nivel2 = await prisma.niveles.upsert({
      where: { 
        id_torre_numero: {
          id_torre: torre.id_torre,
          numero: 2
        }
      },
      update: {},
      create: {
        numero: 2,
        nombre: 'Primer Piso',
        id_torre: torre.id_torre
      }
    });

    console.log(`✅ Niveles creados: ${nivel1.nombre}, ${nivel2.nombre}`);

    // 3. Crear departamentos
    const depto101 = await prisma.departamentos.upsert({
      where: {
        no_departamento_id_torre: {
          no_departamento: '101',
          id_torre: torre.id_torre
        }
      },
      update: {},
      create: {
        no_departamento: '101',
        id_torre: torre.id_torre
      }
    });

    const depto102 = await prisma.departamentos.upsert({
      where: {
        no_departamento_id_torre: {
          no_departamento: '102',
          id_torre: torre.id_torre
        }
      },
      update: {},
      create: {
        no_departamento: '102',
        id_torre: torre.id_torre
      }
    });

    const depto201 = await prisma.departamentos.upsert({
      where: {
        no_departamento_id_torre: {
          no_departamento: '201',
          id_torre: torre.id_torre
        }
      },
      update: {},
      create: {
        no_departamento: '201',
        id_torre: torre.id_torre
      }
    });

    console.log(`✅ Departamentos creados: 101, 102, 201`);

    // 4. Relacionar departamentos con niveles
    await prisma.departamentosNivel.upsert({
      where: {
        id_departamento_id_nivel: {
          id_departamento: depto101.id_departamento,
          id_nivel: nivel1.id_nivel
        }
      },
      update: {},
      create: {
        id_departamento: depto101.id_departamento,
        id_nivel: nivel1.id_nivel
      }
    });

    await prisma.departamentosNivel.upsert({
      where: {
        id_departamento_id_nivel: {
          id_departamento: depto102.id_departamento,
          id_nivel: nivel1.id_nivel
        }
      },
      update: {},
      create: {
        id_departamento: depto102.id_departamento,
        id_nivel: nivel1.id_nivel
      }
    });

    await prisma.departamentosNivel.upsert({
      where: {
        id_departamento_id_nivel: {
          id_departamento: depto201.id_departamento,
          id_nivel: nivel2.id_nivel
        }
      },
      update: {},
      create: {
        id_departamento: depto201.id_departamento,
        id_nivel: nivel2.id_nivel
      }
    });

    console.log(`✅ Relaciones departamento-nivel creadas`);

    // 5. Obtener usuario admin para los residentes
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      throw new Error('No se encontró usuario admin');
    }

    // 6. Crear residentes de prueba
    const residente1 = await prisma.companeros.upsert({
      where: { id_companero: 'test-residente-1' },
      update: {},
      create: {
        id_companero: 'test-residente-1',
        nombre: 'Juan',
        apellidos: 'Pérez García',
        fecha_nacimiento: new Date('1985-03-15'),
        no_personas: 4,
        no_des_per: 0,
        recibo_apoyo: 'NO',
        id_departamento: depto101.id_departamento,
        estatus: 'ACTIVO',
        createdById: adminUser.id
      }
    });

    const residente2 = await prisma.companeros.upsert({
      where: { id_companero: 'test-residente-2' },
      update: {},
      create: {
        id_companero: 'test-residente-2',
        nombre: 'María',
        apellidos: 'González López',
        fecha_nacimiento: new Date('1990-07-22'),
        no_personas: 2,
        no_des_per: 1,
        recibo_apoyo: 'SI',
        no_apoyo: 1500,
        id_departamento: depto102.id_departamento,
        estatus: 'ACTIVO',
        createdById: adminUser.id
      }
    });

    const residente3 = await prisma.companeros.upsert({
      where: { id_companero: 'test-residente-3' },
      update: {},
      create: {
        id_companero: 'test-residente-3',
        nombre: 'Carlos',
        apellidos: 'Rodríguez Martín',
        fecha_nacimiento: new Date('1978-11-08'),
        no_personas: 3,
        no_des_per: 0,
        recibo_apoyo: 'NO',
        id_departamento: depto201.id_departamento,
        estatus: 'ACTIVO',
        createdById: adminUser.id
      }
    });

    console.log(`✅ Residentes creados: Juan Pérez (101), María González (102), Carlos Rodríguez (201)`);

    // 7. Crear información financiera
    await prisma.info_Financiero.upsert({
      where: { id_companeros: residente1.id_companero },
      update: {},
      create: {
        id_companeros: residente1.id_companero,
        excelente: 'SI',
        aport: 'SI',
        deuda: '0',
        estacionamiento: 'NO',
        aportacion: '2500',
        aportacion_deuda: '0',
        apoyo_renta: 'NO',
        comentarios: 'Residente modelo, siempre al día con pagos'
      }
    });

    await prisma.info_Financiero.upsert({
      where: { id_companeros: residente2.id_companero },
      update: {},
      create: {
        id_companeros: residente2.id_companero,
        excelente: 'NO',
        aport: 'SI',
        deuda: '1200',
        estacionamiento: 'SI',
        aportacion: '2500',
        aportacion_deuda: '1200',
        apoyo_renta: 'SI',
        comentarios: 'Recibe apoyo por discapacidad, adeuda 2 mensualidades'
      }
    });

    await prisma.info_Financiero.upsert({
      where: { id_companeros: residente3.id_companero },
      update: {},
      create: {
        id_companeros: residente3.id_companero,
        excelente: 'SI',
        aport: 'SI',
        deuda: '500',
        estacionamiento: 'SI',
        aportacion: '2500',
        aportacion_deuda: '500',
        apoyo_renta: 'NO',
        comentarios: 'Buen pagador, deuda menor'
      }
    });

    console.log(`✅ Información financiera creada para todos los residentes`);

    console.log('\n🎉 Datos de prueba creados exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`- Torre: ${torre.letra}`);
    console.log(`- Niveles: 2 (Planta Baja, Primer Piso)`);
    console.log(`- Departamentos: 3 (101, 102, 201)`);
    console.log(`- Residentes: 3`);
    console.log(`  • Juan Pérez - Depto 101 (Planta Baja)`);
    console.log(`  • María González - Depto 102 (Planta Baja)`);
    console.log(`  • Carlos Rodríguez - Depto 201 (Primer Piso)`);

  } catch (error) {
    console.error('❌ Error al crear datos de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
