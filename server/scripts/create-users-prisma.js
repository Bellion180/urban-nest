import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conectado a MySQL');

    // Hash para las contraseñas
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userPasswordHash = await bcrypt.hash('user123', 10);

    console.log('🔄 Creando usuarios...');

    // Crear usuario admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin' },
      update: {},
      create: {
        email: 'admin',
        password: adminPasswordHash,
        role: 'ADMIN',
        name: 'Administrador Principal'
      }
    });

    console.log('✅ Usuario admin creado:', admin.email);

    // Crear usuario regular
    const user = await prisma.user.upsert({
      where: { email: 'user' },
      update: {},
      create: {
        email: 'user',
        password: userPasswordHash,
        role: 'USER',
        name: 'Usuario Regular'
      }
    });

    console.log('✅ Usuario regular creado:', user.email);

    console.log('\n📋 Credenciales de acceso:');
    console.log('👤 Admin: email="admin", password="admin123"');
    console.log('👤 User:  email="user", password="user123"');

  } catch (error) {
    console.error('❌ Error al crear usuarios:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}

createUsers();
