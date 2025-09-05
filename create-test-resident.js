import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestResident() {
  try {
    console.log('🏗️  Creando residente de prueba con información financiera e INVI...');

    // Obtener el primer edificio y apartamento disponibles
    const building = await prisma.building.findFirst({
      include: {
        floors: {
          include: {
            apartments: true
          }
        }
      }
    });

    if (!building || !building.floors[0] || !building.floors[0].apartments[0]) {
      console.log('❌ No hay edificios o apartamentos disponibles');
      return;
    }

    const apartment = building.floors[0].apartments[0];
    
    // Obtener un usuario administrador para asignar como creador
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('❌ No se encontró usuario administrador');
      return;
    }

    // Crear residente con información completa
    const resident = await prisma.resident.create({
      data: {
        nombre: 'Juan Carlos',
        apellido: 'Pérez López',
        edad: 35,
        email: 'juan.perez@example.com',
        telefono: '+52 55 1234 5678',
        fechaNacimiento: new Date('1988-05-15'),
        noPersonas: 3,
        discapacidad: false,
        deudaActual: 2500.00,
        pagosRealizados: 15000.00,
        profilePhoto: null,
        buildingId: building.id,
        apartmentId: apartment.id,
        estatus: 'ACTIVO',
        createdById: adminUser.id,
        // Crear información INVI
        inviInfo: {
          create: {
            idInvi: 'INVI-2024-001234',
            mensualidades: 48,
            fechaContrato: new Date('2022-03-15'),
            deuda: 145000.00,
            idCompanero: 'COMP-5678'
          }
        }
      },
      include: {
        building: true,
        apartment: {
          include: {
            floor: true
          }
        },
        inviInfo: true
      }
    });

    console.log('✅ Residente de prueba creado exitosamente:');
    console.log('   Nombre:', resident.nombre, resident.apellido);
    console.log('   Edificio:', resident.building.name);
    console.log('   Apartamento:', resident.apartment.number);
    console.log('   Piso:', resident.apartment.floor.name);
    console.log('   Deuda Actual:', `$${resident.deudaActual}`);
    console.log('   Pagos Realizados:', `$${resident.pagosRealizados}`);
    
    if (resident.inviInfo) {
      console.log('   INVI Info:');
      console.log('     - ID INVI:', resident.inviInfo.idInvi);
      console.log('     - Mensualidades:', resident.inviInfo.mensualidades);
      console.log('     - Fecha Contrato:', resident.inviInfo.fechaContrato?.toLocaleDateString('es-MX'));
      console.log('     - Deuda INVI:', `$${resident.inviInfo.deuda}`);
      console.log('     - ID Compañero:', resident.inviInfo.idCompanero);
    }

    // Crear algunos pagos de ejemplo
    await prisma.payment.createMany({
      data: [
        {
          residentId: resident.id,
          amount: 2500.00,
          type: 'CUOTA_MANTENIMIENTO',
          date: new Date('2024-08-01'),
          description: 'Mantenimiento Agosto 2024'
        },
        {
          residentId: resident.id,
          amount: 2500.00,
          type: 'CUOTA_MANTENIMIENTO',
          date: new Date('2024-07-01'),
          description: 'Mantenimiento Julio 2024'
        },
        {
          residentId: resident.id,
          amount: 5000.00,
          type: 'SERVICIOS_ADICIONALES',
          date: new Date('2024-06-15'),
          description: 'Pago de mejoras'
        }
      ]
    });

    console.log('✅ Pagos de ejemplo agregados');
    console.log('🎉 ¡Residente de prueba listo para visualizar!');

  } catch (error) {
    console.error('❌ Error creando residente de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestResident();
