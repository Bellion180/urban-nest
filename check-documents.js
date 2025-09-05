import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDocuments() {
  try {
    console.log('🔍 Verificando documentos en la base de datos...\n');
    
    const residents = await prisma.resident.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        documentoCurp: true,
        documentoComprobanteDomicilio: true,
        documentoActaNacimiento: true,
        documentoIne: true,
        buildingId: true,
        apartment: {
          select: {
            number: true
          }
        }
      }
    });

    residents.forEach(resident => {
      console.log(`👤 ${resident.nombre} ${resident.apellido} (${resident.apartment?.number || 'N/A'})`);
      console.log(`   CURP: ${resident.documentoCurp || 'NO'}`);
      console.log(`   Comprobante: ${resident.documentoComprobanteDomicilio || 'NO'}`);
      console.log(`   Acta: ${resident.documentoActaNacimiento || 'NO'}`);
      console.log(`   INE: ${resident.documentoIne || 'NO'}`);
      console.log('---');
    });

    console.log(`\n📊 Total de residentes: ${residents.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDocuments();
