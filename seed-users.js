import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inicializando base de datos Urban Nest...');

  // Verificar si ya hay usuarios
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('📊 Base de datos ya tiene usuarios. Omitiendo seed.');
    console.log(`👥 Usuarios existentes: ${existingUsers}`);
    return;
  }

  console.log('🔧 Creando usuarios iniciales...');

  // Hashear las contraseñas
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
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

  const user = await prisma.user.create({
    data: {
      email: 'user@urbannest.com',
      password: userPassword,
      name: 'Usuario Regular',
      role: 'USER'
    }
  });

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
  console.log('👤 Usuario:', user.email);
  console.log('🏠 Residente:', resident.email);

  // Crear datos de ejemplo
  await createSampleBuildings();
  
  console.log('\n📧 Credenciales de acceso:');
  console.log('admin@urbannest.com / admin123');
  console.log('user@urbannest.com / user123');
  console.log('resident@urbannest.com / resident123');
  console.log('\n🚀 Base de datos inicializada correctamente!');
}

async function createSampleBuildings() {
  console.log('🏢 Creando edificios de ejemplo...');
  
  try {
    const building = await prisma.building.create({
      data: {
        name: 'Torre Residencial Demo',
        description: 'Edificio de ejemplo para demonstración del sistema Urban Nest',
        image: '/placeholder.svg'
      }
    });

    console.log('🏢 Edificio de ejemplo creado:', building.name);

    // Crear algunos pisos de ejemplo
    const floors = [];
    for (let i = 1; i <= 3; i++) {
      const floor = await prisma.floor.create({
        data: {
          number: i,
          name: i === 1 ? 'Planta Baja' : `Piso ${i}`,
          buildingId: building.id
        }
      });
      floors.push(floor);
    }

    console.log(`🏗️ ${floors.length} pisos creados para el edificio demo`);

    // Crear algunos residentes de ejemplo
    const residents = [
      {
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        phone: '+1234567890',
        apartment: '101',
        buildingId: building.id,
        userId: null,
        status: 'ACTIVO'
      },
      {
        name: 'María García',
        email: 'maria.garcia@email.com', 
        phone: '+1234567891',
        apartment: '201',
        buildingId: building.id,
        userId: null,
        status: 'ACTIVO'
      }
    ];

    for (const residentData of residents) {
      await prisma.resident.create({ data: residentData });
    }

    console.log(`👥 ${residents.length} residentes de ejemplo creados`);

  } catch (error) {
    console.log('⚠️ Error creando datos de ejemplo (esto es normal si el schema no tiene todas las tablas):', error.message);
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
