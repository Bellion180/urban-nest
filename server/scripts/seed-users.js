import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    // Crear usuario administrador
    const adminEmail = 'admin@urbannest.com';
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password: adminPassword,
        name: 'Administrador',
        role: 'ADMIN',
      },
    });

    // Crear usuario normal
    const userEmail = 'usuario@urbannest.com';
    const userPassword = await bcrypt.hash('usuario123', 10);
    await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: {
        email: userEmail,
        password: userPassword,
        name: 'Usuario Especial',
        role: 'USER',
      },
    });

    console.log('Usuarios creados exitosamente');
  } catch (error) {
    console.error('Error al crear usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
