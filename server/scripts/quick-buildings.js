import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function quickCreateBuildings() {
  try {
    console.log('🔄 Creando edificios rápidamente...');

    // Verificar si ya existen edificios
    const existingBuildings = await prisma.building.findMany();
    if (existingBuildings.length > 0) {
      console.log(`✅ Ya existen ${existingBuildings.length} edificios en la base de datos`);
      existingBuildings.forEach(building => {
        console.log(`   - ${building.name}: ${building.description}`);
      });
      return;
    }

    // Crear solo el Edificio A con estructura básica
    const buildingA = await prisma.building.create({
      data: {
        name: 'Edificio A',
        description: 'Edificio principal con 3 pisos',
        image: '/lovable-uploads/building-a.jpg',
        floors: {
          create: [
            {
              name: 'Planta Baja',
              number: 0,
              apartments: {
                create: [
                  { number: 'A-001' },
                  { number: 'A-002' }
                ]
              }
            },
            {
              name: 'Primer Piso',
              number: 1,
              apartments: {
                create: [
                  { number: 'A-101' },
                  { number: 'A-102' }
                ]
              }
            },
            {
              name: 'Segundo Piso',
              number: 2,
              apartments: {
                create: [
                  { number: 'A-201' },
                  { number: 'A-202' }
                ]
              }
            }
          ]
        }
      }
    });

    console.log('✅ Edificio A creado exitosamente');

    // Crear Edificio B
    const buildingB = await prisma.building.create({
      data: {
        name: 'Edificio B',
        description: 'Edificio residencial con 2 pisos',
        image: '/lovable-uploads/building-b.jpg',
        floors: {
          create: [
            {
              name: 'Planta Baja',
              number: 0,
              apartments: {
                create: [
                  { number: 'B-001' },
                  { number: 'B-002' }
                ]
              }
            },
            {
              name: 'Primer Piso',
              number: 1,
              apartments: {
                create: [
                  { number: 'B-101' },
                  { number: 'B-102' }
                ]
              }
            }
          ]
        }
      }
    });

    console.log('✅ Edificio B creado exitosamente');

    console.log('\n📊 Edificios creados en la base de datos:');
    console.log('🏢 Edificio A: 3 pisos, 6 departamentos');
    console.log('🏢 Edificio B: 2 pisos, 4 departamentos');

  } catch (error) {
    console.error('❌ Error al crear edificios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickCreateBuildings();
