import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUserLogin() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'usuario@urbannest.com' }
    });

    if (existingUser) {
      console.log('El usuario ya existe, no se creará uno nuevo.');
      return existingUser;
    }

    // Create the special user account
    const hashedPassword = await bcrypt.hash('usuario123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'usuario@urbannest.com',
        password: hashedPassword,
        name: 'Usuario Especial',
        role: 'USER'
      }
    });

    console.log('Usuario especial creado exitosamente:', user);
    return user;
  } catch (error) {
    console.error('Error al crear el usuario especial:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función y manejar el resultado
createUserLogin()
  .then(() => {
    console.log('Proceso completado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el proceso:', error);
    process.exit(1);
  });
