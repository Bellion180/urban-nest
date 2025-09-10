// Test simple del endpoint de departments
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDepartmentsEndpoint() {
  try {
    console.log('🧪 Probando query de departamentos jerárquicos...');

    // Esta es la misma query que está en el endpoint
    const torres = await prisma.torres.findMany({
      select: {
        id_torre: true,
        letra: true,
        descripcion: true,
        niveles: {
          select: {
            id_nivel: true,
            nombre: true,
            numero: true,
            departamentos: {
              select: {
                id_departamento: true,
                nombre: true,
                no_departamento: true
              },
              orderBy: {
                no_departamento: 'asc'
              }
            }
          },
          orderBy: {
            numero: 'asc'
          }
        }
      },
      orderBy: {
        letra: 'asc'
      }
    });

    console.log(`✅ Torres encontradas: ${torres.length}`);
    
    // Mapear la estructura
    const mappedData = torres.map(torre => ({
      id: torre.id_torre,
      name: torre.descripcion || `Torre ${torre.letra}`,
      letter: torre.letra,
      levels: torre.niveles.map(nivel => ({
        id: nivel.id_nivel,
        name: nivel.nombre,
        number: nivel.numero,
        departments: nivel.departamentos.map(dept => ({
          id: dept.id_departamento,
          number: dept.no_departamento,
          name: dept.nombre || dept.no_departamento
        }))
      }))
    }));

    console.log('🏗️ Estructura mapeada:', JSON.stringify(mappedData, null, 2));
    
    console.log('✅ Test exitoso - El endpoint debería funcionar');

  } catch (error) {
    console.error('❌ Error en test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDepartmentsEndpoint();
