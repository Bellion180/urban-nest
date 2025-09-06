import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNewDatabase() {
  console.log('🧪 Probando la nueva estructura de base de datos...\n');

  try {
    // 1. Probar conexión
    await prisma.$connect();
    console.log('✅ Conexión a base de datos establecida');

    // 2. Listar torres
    const torres = await prisma.torres.findMany({
      include: {
        departamentos: {
          include: {
            companeros: {
              include: {
                info_financiero: true,
                financieros: true
              }
            }
          }
        }
      }
    });

    console.log('\n🏢 Torres disponibles:');
    torres.forEach(torre => {
      console.log(`   Torre ${torre.letra} (${torre.nivel})`);
      console.log(`      - Departamentos: ${torre.departamentos.length}`);
      
      torre.departamentos.forEach(depto => {
        console.log(`        • Depto ${depto.no_departamento}: ${depto.companeros.length} compañeros`);
        
        depto.companeros.forEach(companero => {
          console.log(`          - ${companero.nombre} ${companero.apellidos}`);
          console.log(`            Personas: ${companero.no_personas}, Discapacidad: ${companero.no_des_per}`);
          if (companero.info_financiero) {
            console.log(`            Deuda: $${companero.info_financiero.deuda}`);
          }
        });
      });
    });

    // 3. Probar creación de nuevo compañero
    console.log('\n👤 Creando compañero de prueba...');
    const primerDepartamento = torres[0]?.departamentos[0];
    
    // Obtener usuario admin para el createdById
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (primerDepartamento && adminUser) {
      const nuevoCompanero = await prisma.companeros.create({
        data: {
          nombre: 'Prueba',
          apellidos: 'Test Usuario',
          fecha_nacimiento: new Date('1990-01-01'),
          no_personas: 2,
          no_des_per: 0,
          recibo_apoyo: 'SI',
          no_apoyo: 1000,
          id_departamento: primerDepartamento.id_departamento,
          createdById: adminUser.id
        },
        include: {
          departamento: {
            include: { torre: true }
          }
        }
      });

      console.log(`✅ Compañero creado: ${nuevoCompanero.nombre} ${nuevoCompanero.apellidos}`);
      console.log(`   Asignado a Depto ${nuevoCompanero.departamento?.no_departamento}, Torre ${nuevoCompanero.departamento?.torre?.letra}`);

      // 4. Crear información financiera para el compañero
      const infoFinanciera = await prisma.info_Financiero.create({
        data: {
          excelente: 'SI',
          aport: '2000',
          deuda: '5000',
          estacionamiento: 'NO',
          aportacion: '1200',
          aportacion_deuda: '300',
          apoyo_renta: 'SI',
          comentarios: 'Compañero de prueba - información financiera de ejemplo',
          id_companeros: nuevoCompanero.id_companero
        }
      });

      console.log(`✅ Info financiera creada para ${nuevoCompanero.nombre}`);

      // 5. Eliminar compañero de prueba
      await prisma.companeros.delete({
        where: { id_companero: nuevoCompanero.id_companero }
      });

      console.log(`🗑️ Compañero de prueba eliminado`);
    }

    console.log('\n🎉 Pruebas completadas exitosamente!');
    console.log('✅ La nueva estructura de base de datos está funcionando correctamente.');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewDatabase();
