// Script simple para crear un usuario admin
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔍 Verificando si existe usuario admin...');
    
    const existingAdmin = await prisma.users.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (existingAdmin) {
      console.log('✅ Usuario admin ya existe:', existingAdmin.email);
      return;
    }
    
    console.log('🔧 Creando usuario admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.users.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        nombre: 'Admin',
        apellido: 'Test',
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Usuario admin creado exitosamente:', adminUser.email);
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
