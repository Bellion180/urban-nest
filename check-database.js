import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Verificando directamente en la base de datos...\n');

    // Verificar todos los residentes
    const residents = await prisma.resident.findMany({
      include: {
        inviInfo: true,
        payments: true,
        building: true,
        apartment: {
          include: {
            floor: true
          }
        }
      }
    });

    console.log(`Encontrados ${residents.length} residentes:\n`);

    residents.forEach((resident, index) => {
      console.log(`🔸 Residente ${index + 1}:`);
      console.log(`   ID: ${resident.id}`);
      console.log(`   Nombre: ${resident.nombre} ${resident.apellido}`);
      console.log(`   Email: ${resident.email}`);
      console.log(`   Deuda Actual: $${resident.deudaActual}`);
      console.log(`   Pagos Realizados: $${resident.pagosRealizados}`);
      
      if (resident.inviInfo) {
        console.log(`   ✅ INVI INFO encontrada:`);
        console.log(`     - ID INVI: ${resident.inviInfo.idInvi}`);
        console.log(`     - Mensualidades: ${resident.inviInfo.mensualidades}`);
        console.log(`     - Deuda INVI: $${resident.inviInfo.deuda}`);
        console.log(`     - Fecha Contrato: ${resident.inviInfo.fechaContrato}`);
        console.log(`     - ID Compañero: ${resident.inviInfo.idCompanero}`);
      } else {
        console.log(`   ❌ Sin información INVI`);
      }

      if (resident.payments && resident.payments.length > 0) {
        console.log(`   💰 Pagos: ${resident.payments.length}`);
      } else {
        console.log(`   ❌ Sin pagos`);
      }
      console.log('');
    });

    // Verificar específicamente información INVI
    const inviInfoRecords = await prisma.inviInfo.findMany({
      include: {
        resident: true
      }
    });

    console.log(`\n🏠 Registros INVI en la base de datos: ${inviInfoRecords.length}\n`);
    inviInfoRecords.forEach((invi, index) => {
      console.log(`INVI ${index + 1}:`);
      console.log(`   ID: ${invi.id}`);
      console.log(`   Residente ID: ${invi.residentId}`);
      console.log(`   Residente: ${invi.resident.nombre} ${invi.resident.apellido}`);
      console.log(`   ID INVI: ${invi.idInvi}`);
      console.log(`   Mensualidades: ${invi.mensualidades}`);
      console.log(`   Deuda: $${invi.deuda}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
