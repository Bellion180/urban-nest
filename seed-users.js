import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inicializando base de datos Urban Nest...');

  // Verificar argumentos de línea de comandos
  const forceReset = process.argv.includes('--force') || process.argv.includes('-f');

  if (forceReset) {
    console.log('🔄 Modo force activado - limpiando base de datos...');
    
    // Eliminar datos en orden correcto debido a las relaciones
    await prisma.info_Tlaxilacalli.deleteMany();
    await prisma.iNVI.deleteMany();
    await prisma.info_Financiero.deleteMany();
    await prisma.financieros.deleteMany();
    await prisma.companeros.deleteMany();
    await prisma.departamentos.deleteMany();
    await prisma.niveles.deleteMany();
    await prisma.torres.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('🗑️ Base de datos limpiada');
  } else {
    // Verificar si ya hay usuarios
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log('📊 Base de datos ya tiene usuarios. Omitiendo seed.');
      console.log(`👥 Usuarios existentes: ${existingUsers}`);
      console.log('💡 Usa --force para reinicializar la base de datos');
      return;
    }
  }

  console.log('🔧 Creando usuarios iniciales...');

  // Hashear las contraseñas
  const adminPassword = await bcrypt.hash('admin123', 10);
  const residentPassword = await bcrypt.hash('resident123', 10);

  // Crear usuarios
  const admin = await prisma.user.create({
    data: {
      email: 'admin@urbannest.com',
      password: adminPassword,
      name: 'Administrador Principal',
      role: 'ADMIN'
    }
  });

<<<<<<< HEAD
  const user = await prisma.user.create({
    data: {
      email: 'user@urbannest.com',
      password: userPassword,
      name: 'Usuario Regular',
      role: 'RESIDENT'
    }
  });

=======
>>>>>>> f1590a7 (nueva base)
  const resident = await prisma.user.create({
    data: {
      email: 'resident@urbannest.com',
      password: residentPassword,
      name: 'Residente de Prueba',
      role: 'RESIDENT'
    }
  });

  console.log('✅ Usuarios creados:');
  console.log('👑 Admin:', admin.email);
  console.log('🏠 Residente:', resident.email);

  // Crear datos de ejemplo
  await createSampleData(admin.id);
  
  
  console.log('\n📧 Credenciales de acceso:');
  console.log('admin@urbannest.com / admin123');
  console.log('resident@urbannest.com / resident123');
  console.log('\n🚀 Base de datos inicializada correctamente!');
}

async function createSampleData(adminId) {
  console.log('🏢 Creando torres de ejemplo...');
  
  try {
    // Crear Torre A
    const torreA = await prisma.torres.create({
      data: {
        letra: 'A',
        descripcion: 'Torre Residencial A'
      }
    });

    // Crear Torre B
    const torreB = await prisma.torres.create({
      data: {
        letra: 'B',
        descripcion: 'Torre Residencial B'
      }
    });

    console.log('🏢 Torres creadas:', torreA.letra, torreB.letra);

    // Crear niveles para Torre A (3 pisos)
    const nivelesA = [];
    for (let i = 1; i <= 3; i++) {
      const nivel = await prisma.niveles.create({
        data: {
          numero: i,
          nombre: i === 1 ? 'Planta Baja' : `Piso ${i}`,
          id_torre: torreA.id_torre
        }
      });
      nivelesA.push(nivel);
    }

    // Crear niveles para Torre B (2 pisos)
    const nivelesB = [];
    for (let i = 1; i <= 2; i++) {
      const nivel = await prisma.niveles.create({
        data: {
          numero: i,
          nombre: i === 1 ? 'Planta Baja' : `Piso ${i}`,
          id_torre: torreB.id_torre
        }
      });
      nivelesB.push(nivel);
    }

    console.log(`🏗️ Niveles creados: ${nivelesA.length} para Torre A, ${nivelesB.length} para Torre B`);

    // Crear departamentos para Torre A - Primer piso
    const departamentosA1 = [];
    const apartmentNumbers1 = ['101', '102', '103'];
    
    for (const aptNum of apartmentNumbers1) {
      const depto = await prisma.departamentos.create({
        data: {
          nombre: `Departamento ${aptNum}`,
          descripcion: `Apartamento ${aptNum}`,
          id_torre: torreA.id_torre,
          id_nivel: nivelesA[0].id_nivel  // Primer piso
        }
      });
      departamentosA1.push(depto);
    }

    // Crear departamentos para Torre A - Segundo piso
    const departamentosA2 = [];
    const apartmentNumbers2 = ['201', '202'];
    
    for (const aptNum of apartmentNumbers2) {
      const depto = await prisma.departamentos.create({
        data: {
          nombre: `Departamento ${aptNum}`,
          descripcion: `Apartamento ${aptNum}`,
          id_torre: torreA.id_torre,
          id_nivel: nivelesA[1].id_nivel  // Segundo piso
        }
      });
      departamentosA2.push(depto);
    }

    // Crear departamentos para Torre A - Tercer piso
    const departamentosA3 = [];
    const apartmentNumbers3 = ['301'];
    
    for (const aptNum of apartmentNumbers3) {
      const depto = await prisma.departamentos.create({
        data: {
          nombre: `Departamento ${aptNum}`,
          descripcion: `Apartamento ${aptNum}`,
          id_torre: torreA.id_torre,
          id_nivel: nivelesA[2].id_nivel  // Tercer piso
        }
      });
      departamentosA3.push(depto);
    }

    // Crear departamentos para Torre B - Primer piso
    const departamentosB1 = [];
    const apartmentNumbersB1 = ['101', '102'];
    
    for (const aptNum of apartmentNumbersB1) {
      const depto = await prisma.departamentos.create({
        data: {
          nombre: `Departamento ${aptNum}`,
          descripcion: `Apartamento ${aptNum}`,
          id_torre: torreB.id_torre,
          id_nivel: nivelesB[0].id_nivel  // Primer piso
        }
      });
      departamentosB1.push(depto);
    }

    // Crear departamentos para Torre B - Segundo piso
    const departamentosB2 = [];
    const apartmentNumbersB2 = ['201', '202'];
    
    for (const aptNum of apartmentNumbersB2) {
      const depto = await prisma.departamentos.create({
        data: {
          nombre: `Departamento ${aptNum}`,
          descripcion: `Apartamento ${aptNum}`,
          id_torre: torreB.id_torre,
          id_nivel: nivelesB[1].id_nivel  // Segundo piso
        }
      });
      departamentosB2.push(depto);
    }

    const allDepartamentos = [...departamentosA1, ...departamentosA2, ...departamentosA3, ...departamentosB1, ...departamentosB2];
    console.log(`🏠 Departamentos creados: ${allDepartamentos.length} total`);

    // Crear compañeros (residentes) de ejemplo
    const compañeros = [
      {
        nombre: 'Juan',
        apellidos: 'Pérez González',
        fecha_nacimiento: new Date('1985-03-15'),
        no_personas: 3,
        id_departamento: departamentosA1[0].id_departamento, // 101 Torre A
        createdById: adminId
      },
      {
        nombre: 'María',
        apellidos: 'García López',
        fecha_nacimiento: new Date('1990-07-22'),
        no_personas: 2,
        id_departamento: departamentosA1[1].id_departamento, // 102 Torre A
        createdById: adminId
      },
      {
        nombre: 'Carlos',
        apellidos: 'Rodríguez Martín',
        fecha_nacimiento: new Date('1982-11-08'),
        no_personas: 4,
        id_departamento: departamentosA2[0].id_departamento, // 201 Torre A
        createdById: adminId
      },
      {
        nombre: 'Ana',
        apellidos: 'Fernández Silva',
        fecha_nacimiento: new Date('1988-05-12'),
        no_personas: 1,
        id_departamento: departamentosB2[0].id_departamento, // 201 Torre B
        createdById: adminId
      }
    ];

    for (const companeroData of compañeros) {
      const companero = await prisma.companeros.create({ 
        data: companeroData,
        include: {
          departamento: {
            include: {
              torre: true,
              nivel: true
            }
          }
        }
      });

      // Crear información financiera básica
      await prisma.info_Financiero.create({
        data: {
          excelente: 'SI',
          aport: '1000',
          deuda: '0',
          estacionamiento: 'NO',
          aportacion: '500',
          aportacion_deuda: '0',
          apoyo_renta: 'NO',
          comentarios: 'Residente modelo',
          id_companeros: companero.id_companero
        }
      });

      console.log(`� Compañero creado: ${companero.nombre} ${companero.apellidos} - Torre ${companero.departamento?.torre?.letra} Depto ${companero.departamento?.no_departamento}`);
    }

    console.log(`👥 ${compañeros.length} compañeros de ejemplo creados con información financiera`);

  } catch (error) {
    console.error('⚠️ Error creando datos de ejemplo:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
