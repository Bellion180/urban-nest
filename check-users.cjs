// Verificar usuarios en la base de datos
const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Buscando usuarios en la base de datos...');
    
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true
      }
    });
    
    console.log('👥 Usuarios encontrados:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ID: ${user.id}`);
    });
    
    if (users.length === 0) {
      console.log('⚠️ No hay usuarios en la base de datos');
      
      // Crear usuario admin de prueba
      console.log('🔧 Creando usuario admin de prueba...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newUser = await prisma.users.create({
        data: {
          email: 'admin@test.com',
          password: hashedPassword,
          nombre: 'Admin',
          apellido: 'Test',
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Usuario admin creado:', newUser.email);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
