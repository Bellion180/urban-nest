import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Verificando si existe usuario admin...');
    
    // Verificar si ya existe un usuario con este email
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@urbannest.com' }
    });
    
    if (existingUser) {
      console.log('El usuario admin ya existe. No se realizarán cambios.');
      return;
    }
    
    console.log('Creando usuario admin...');
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Crear usuario administrador
    const admin = await prisma.user.create({
      data: {
        email: 'admin@urbannest.com',
        password: hashedPassword,
        name: 'Administrador Sistema',
        role: 'ADMIN'
      }
    });
    
    console.log('Usuario admin creado exitosamente:', admin);
    
  } catch (error) {
    console.error('Error al crear usuario admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
