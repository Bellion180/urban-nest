import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

async function testTorresCreation() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 PROBANDO CREACIÓN DE TORRES CON PRISMA\n');

    // 1. Conectar a Prisma
    await prisma.$connect();
    console.log('✅ Conexión a Prisma establecida');

    // 2. Intentar crear una torre simple (sin niveles)
    console.log('\n📋 Creando torre simple...');
    const torreSimple = await prisma.torres.create({
      data: {
        letra: 'TEST-A',
        descripcion: 'Torre de prueba simple'
      }
    });
    console.log('✅ Torre simple creada:', torreSimple.id_torre);

    // 3. Intentar crear una torre compleja (con niveles y departamentos)
    console.log('\n🏗️ Creando torre compleja...');
    const torreCompleja = await prisma.torres.create({
      data: {
        letra: 'TEST-B',
        descripcion: 'Torre de prueba compleja',
        imagen: '/test/image.jpg',
        niveles: {
          create: [
            {
              nombre: 'Piso 1',
              numero: 1,
              departamentos: {
                create: [
                  {
                    nombre: '101',
                    no_departamento: '101',
                    descripcion: 'Departamento 101'
                  },
                  {
                    nombre: '102', 
                    no_departamento: '102',
                    descripcion: 'Departamento 102'
                  }
                ]
              }
            },
            {
              nombre: 'Piso 2',
              numero: 2,
              departamentos: {
                create: [
                  {
                    nombre: '201',
                    no_departamento: '201', 
                    descripcion: 'Departamento 201'
                  }
                ]
              }
            }
          ]
        }
      },
      include: {
        niveles: {
          include: {
            departamentos: true
          }
        }
      }
    });

    console.log('✅ Torre compleja creada:', torreCompleja.id_torre);
    console.log(`   - Niveles: ${torreCompleja.niveles.length}`);
    console.log(`   - Departamentos totales: ${torreCompleja.niveles.reduce((acc, nivel) => acc + nivel.departamentos.length, 0)}`);

    // 4. Verificar que se pueden consultar
    console.log('\n🔍 Consultando torres creadas...');
    const torres = await prisma.torres.findMany({
      include: {
        niveles: {
          include: {
            departamentos: true
          }
        }
      }
    });

    console.log(`✅ ${torres.length} torres encontradas en total`);
    torres.forEach(torre => {
      console.log(`   - ${torre.letra}: ${torre.descripcion}`);
    });

    // 5. Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    await prisma.torres.deleteMany({
      where: {
        letra: {
          startsWith: 'TEST-'
        }
      }
    });
    console.log('✅ Datos de prueba eliminados');

    console.log('\n🎉 ¡TODAS LAS PRUEBAS EXITOSAS!');
    console.log('La creación de edificios con Prisma funciona correctamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testTorresCreation();
