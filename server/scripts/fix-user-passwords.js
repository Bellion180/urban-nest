import { prisma } from '../../src/lib/prisma.js';
import bcrypt from 'bcryptjs';

async function updateUserPasswords() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos');

    console.log('🔄 Actualizando contraseñas...');

    // Hashear las contraseñas correctamente
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userPasswordHash = await bcrypt.hash('user123', 10);

    // Actualizar usuario admin
    await prisma.user.upsert({
      where: { email: 'admin@urbannest.com' },
      update: {
        password: adminPasswordHash,
      },
      create: {
        email: 'admin@urbannest.com',
        password: adminPasswordHash,
        role: 'ADMIN',
        name: 'Administrador Principal'
      }
    });
    console.log('✅ Usuario admin actualizado');

    // Actualizar usuario regular
    await prisma.user.upsert({
      where: { email: 'user@urbannest.com' },
      update: {
        password: userPasswordHash,
      },
      create: {
        email: 'user@urbannest.com',
        password: userPasswordHash,
        role: 'USER',
        name: 'Usuario Regular'
      }
    });
    console.log('✅ Usuario regular actualizado');

    console.log('\n📋 Credenciales de acceso actualizadas:');
    console.log('👤 Admin: email="admin@urbannest.com", password="admin123"');
    console.log('👤 User:  email="user@urbannest.com", password="user123"');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}

updateUserPasswords();
