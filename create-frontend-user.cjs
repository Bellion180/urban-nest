const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createFrontendUser() {
  console.log('👤 Creando usuario frontend...');
  
  try {
    // Verificar si ya existe el usuario
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@urbannest.com' }
    });

    if (existingUser) {
      console.log('ℹ️ Usuario frontend ya existe:', existingUser.email);
      return existingUser;
    }

    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const newUser = await prisma.user.create({
      data: {
        name: 'Admin Frontend',
        email: 'admin@urbannest.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Usuario frontend creado:', {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });

    return newUser;

  } catch (error) {
    console.error('❌ Error creando usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createFrontendUser();
}

module.exports = { createFrontendUser };
