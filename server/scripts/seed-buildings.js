import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBuildings() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conectado a MySQL');

    console.log('🔄 Creando edificios de ejemplo...');

    // Crear Edificio A
    const buildingA = await prisma.building.upsert({
      where: { name: 'Edificio A' },
      update: {},
      create: {
        name: 'Edificio A',
        description: 'Edificio principal con 5 pisos',
        image: '/lovable-uploads/building-a.jpg',
        floors: {
          create: [
            {
              name: 'Planta Baja',
              number: 0,
              apartments: {
                create: [
                  { number: 'A-001' },
                  { number: 'A-002' },
                  { number: 'A-003' },
                  { number: 'A-004' }
                ]
              }
            },
            {
              name: 'Primer Piso',
              number: 1,
              apartments: {
                create: [
                  { number: 'A-101' },
                  { number: 'A-102' },
                  { number: 'A-103' },
                  { number: 'A-104' }
                ]
              }
            },
            {
              name: 'Segundo Piso',
              number: 2,
              apartments: {
                create: [
                  { number: 'A-201' },
                  { number: 'A-202' },
                  { number: 'A-203' },
                  { number: 'A-204' }
                ]
              }
            },
            {
              name: 'Tercer Piso',
              number: 3,
              apartments: {
                create: [
                  { number: 'A-301' },
                  { number: 'A-302' },
                  { number: 'A-303' },
                  { number: 'A-304' }
                ]
              }
            },
            {
              name: 'Cuarto Piso',
              number: 4,
              apartments: {
                create: [
                  { number: 'A-401' },
                  { number: 'A-402' },
                  { number: 'A-403' },
                  { number: 'A-404' }
                ]
              }
            }
          ]
        }
      }
    });

    console.log('✅ Edificio A creado');

    // Crear Edificio B
    const buildingB = await prisma.building.upsert({
      where: { name: 'Edificio B' },
      update: {},
      create: {
        name: 'Edificio B',
        description: 'Edificio residencial con 3 pisos',
        image: '/lovable-uploads/building-b.jpg',
        floors: {
          create: [
            {
              name: 'Planta Baja',
              number: 0,
              apartments: {
                create: [
                  { number: 'B-001' },
                  { number: 'B-002' },
                  { number: 'B-003' }
                ]
              }
            },
            {
              name: 'Primer Piso',
              number: 1,
              apartments: {
                create: [
                  { number: 'B-101' },
                  { number: 'B-102' },
                  { number: 'B-103' }
                ]
              }
            },
            {
              name: 'Segundo Piso',
              number: 2,
              apartments: {
                create: [
                  { number: 'B-201' },
                  { number: 'B-202' },
                  { number: 'B-203' }
                ]
              }
            }
          ]
        }
      }
    });

    console.log('✅ Edificio B creado');

    // Crear Edificio C
    const buildingC = await prisma.building.upsert({
      where: { name: 'Edificio C' },
      update: {},
      create: {
        name: 'Edificio C',
        description: 'Torre moderna con 6 pisos',
        image: '/lovable-uploads/building-c.jpg',
        floors: {
          create: [
            {
              name: 'Planta Baja',
              number: 0,
              apartments: {
                create: [
                  { number: 'C-001' },
                  { number: 'C-002' }
                ]
              }
            },
            {
              name: 'Primer Piso',
              number: 1,
              apartments: {
                create: [
                  { number: 'C-101' },
                  { number: 'C-102' }
                ]
              }
            },
            {
              name: 'Segundo Piso',
              number: 2,
              apartments: {
                create: [
                  { number: 'C-201' },
                  { number: 'C-202' }
                ]
              }
            },
            {
              name: 'Tercer Piso',
              number: 3,
              apartments: {
                create: [
                  { number: 'C-301' },
                  { number: 'C-302' }
                ]
              }
            },
            {
              name: 'Cuarto Piso',
              number: 4,
              apartments: {
                create: [
                  { number: 'C-401' },
                  { number: 'C-402' }
                ]
              }
            },
            {
              name: 'Quinto Piso',
              number: 5,
              apartments: {
                create: [
                  { number: 'C-501' },
                  { number: 'C-502' }
                ]
              }
            }
          ]
        }
      }
    });

    console.log('✅ Edificio C creado');

    // Obtener estadísticas
    const buildings = await prisma.building.findMany({
      include: {
        floors: {
          include: {
            apartments: true
          }
        }
      }
    });

    console.log('\n📊 Estadísticas de edificios creados:');
    buildings.forEach(building => {
      const totalApartments = building.floors.reduce((total, floor) => total + floor.apartments.length, 0);
      console.log(`🏢 ${building.name}: ${building.floors.length} pisos, ${totalApartments} departamentos`);
    });

  } catch (error) {
    console.error('❌ Error al crear edificios:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}

seedBuildings();
