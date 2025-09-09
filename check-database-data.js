import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseData() {
  try {
    console.log('🔍 Verificando datos en la base de datos...\n');
    
    // Verificar torres
    const torres = await prisma.torres.findMany({
      include: {
        niveles: {
          include: {
            departamentos: {
              include: {
                companeros: true
              }
            }
          }
        }
      }
    });
    
    console.log(`📊 TORRES: ${torres.length} encontradas`);
    torres.forEach((torre, index) => {
      const nivelesCount = torre.niveles?.length || 0;
      const departamentosCount = torre.niveles?.reduce((total, nivel) => 
        total + (nivel.departamentos?.length || 0), 0) || 0;
      const residentesCount = torre.niveles?.reduce((total, nivel) => 
        total + nivel.departamentos?.reduce((subTotal, dept) => 
          subTotal + (dept.companeros?.length || 0), 0), 0) || 0;
      
      console.log(`  ${index + 1}. Torre ${torre.letra}`);
      console.log(`     - Niveles: ${nivelesCount}`);
      console.log(`     - Departamentos: ${departamentosCount}`);
      console.log(`     - Residentes: ${residentesCount}`);
    });
    
    // Verificar usuarios
    const usuarios = await prisma.user.findMany();
    console.log(`\n👥 USUARIOS: ${usuarios.length} encontrados`);
    usuarios.forEach((usuario, index) => {
      console.log(`  ${index + 1}. ${usuario.username || usuario.email} (${usuario.role})`);
    });
    
    // Si no hay datos, crear algunos de prueba
    if (torres.length === 0) {
      console.log('\n⚠️  No hay torres en la base de datos. Creando datos de prueba...');
      await createTestData();
    }
    
  } catch (error) {
    console.error('❌ Error verificando datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createTestData() {
  try {
    // Crear torre de prueba
    const torre = await prisma.torres.create({
      data: {
        letra: 'A',
        descripcion: 'Torre de prueba',
        niveles: {
          create: [
            {
              numero: 1,
              nombre: 'Planta Baja',
              departamentos: {
                create: [
                  { nombre: '101' },
                  { nombre: '102' },
                  { nombre: '103' }
                ]
              }
            },
            {
              numero: 2,
              nombre: 'Primer Piso',
              departamentos: {
                create: [
                  { nombre: '201' },
                  { nombre: '202' },
                  { nombre: '203' }
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
    
    console.log('✅ Torre de prueba creada:', torre.letra);
    
    // Crear algunos residentes de prueba
    const departamentos = await prisma.departamentos.findMany({
      where: { id_torre: torre.id_torre }
    });
    
    for (let i = 0; i < Math.min(3, departamentos.length); i++) {
      const companero = await prisma.companeros.create({
        data: {
          nombre: `Residente${i + 1}`,
          apellidos: `Apellido${i + 1}`,
          fecha_nacimiento: new Date('1990-01-01'),
          no_personas: 3 + i,
          no_des_per: i === 0 ? 1 : 0,
          recibo_apoyo: i === 0 ? 'SI' : 'NO',
          no_apoyo: i === 0 ? 'APOYO123' : null,
          id_departamento: departamentos[i].id_departamento,
          estatus: 'ACTIVO'
        }
      });
      
      console.log(`✅ Residente de prueba creado: ${companero.nombre} ${companero.apellidos} en depto ${departamentos[i].nombre}`);
    }
    
    console.log('✅ Datos de prueba creados exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  }
}

checkDatabaseData();
