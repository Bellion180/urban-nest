import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const prisma = new PrismaClient();

async function createResident() {
  try {
    console.log('Verificando si existe usuario residente...');
    
    // Verificar si ya existe un usuario con este email
    const existingUser = await prisma.user.findUnique({
      where: { email: 'resident@urbannest.com' }
    });
    
    if (existingUser) {
      console.log('El usuario residente ya existe. No se realizarán cambios.');
      return;
    }
    
    console.log('Creando usuario residente...');
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash('resident123', 10);
    
    // Crear usuario residente
    const resident = await prisma.user.create({
      data: {
        email: 'resident@urbannest.com',
        password: hashedPassword,
        name: 'Juan Residente',
        role: 'RESIDENT'
      }
    });
    
    console.log('Usuario residente creado exitosamente:', resident);
    
  } catch (error) {
    console.error('Error al crear usuario residente:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createResident();
