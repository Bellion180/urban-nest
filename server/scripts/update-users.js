import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateUsers() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conectado a MySQL');

    // Hash para las contraseñas
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userPasswordHash = await bcrypt.hash('user123', 10);

    console.log('🔄 Actualizando usuarios...');

    // Crear o actualizar usuario admin con el email que usa el frontend
    const admin = await prisma.user.upsert({
      where: { email: 'admin@urbannest.com' },
      update: {
        password: adminPasswordHash,
        role: 'ADMIN',
        name: 'Administrador Principal'
      },
      create: {
        email: 'admin@urbannest.com',
        password: adminPasswordHash,
        role: 'ADMIN',
        name: 'Administrador Principal'
      }
    });

    console.log('✅ Usuario admin actualizado:', admin.email);

    // Crear o actualizar usuario regular con el email que usa el frontend
    const user = await prisma.user.upsert({
      where: { email: 'user@urbannest.com' },
      update: {
        password: userPasswordHash,
        role: 'USER',
        name: 'Usuario Regular'
      },
      create: {
        email: 'user@urbannest.com',
        password: userPasswordHash,
        role: 'USER',
        name: 'Usuario Regular'
      }
    });

    console.log('✅ Usuario regular actualizado:', user.email);

    console.log('\n📋 Credenciales actualizadas:');
    console.log('👤 Admin: email="admin@urbannest.com", password="admin123"');
    console.log('👤 User:  email="user@urbannest.com", password="user123"');

  } catch (error) {
    console.error('❌ Error al actualizar usuarios:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}

updateUsers();
