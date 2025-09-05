import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultUsers() {
  try {
    console.log('🔄 Creando usuarios por defecto...');

    // Verificar si los usuarios ya existen
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@urbannest.com' }
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: 'user@urbannest.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  El usuario admin ya existe');
    } else {
      // Crear usuario administrador
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      const admin = await prisma.user.create({
        data: {
          email: 'admin@urbannest.com',
          password: hashedAdminPassword,
          role: 'ADMIN',
          name: 'Administrador'
        }
      });
      console.log('✅ Usuario administrador creado:', admin.email);
    }

    if (existingUser) {
      console.log('⚠️  El usuario normal ya existe');
    } else {
      // Crear usuario normal
      const hashedUserPassword = await bcrypt.hash('user123', 10);
      const user = await prisma.user.create({
        data: {
          email: 'user@urbannest.com',
          password: hashedUserPassword,
          role: 'USER',
          name: 'Usuario'
        }
      });
      console.log('✅ Usuario normal creado:', user.email);
    }

    console.log('🎉 Usuarios por defecto creados exitosamente');
    
    // Mostrar todos los usuarios
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 Lista de usuarios en la base de datos:');
    console.table(allUsers);

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultUsers();
