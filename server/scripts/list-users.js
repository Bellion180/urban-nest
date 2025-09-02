import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conectado a MySQL');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true
      }
    });

    console.log('\n📋 Usuarios en la base de datos:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: "${user.email}" | Role: ${user.role} | Name: ${user.name || 'N/A'}`);
    });

    console.log(`\n📊 Total de usuarios: ${users.length}`);

  } catch (error) {
    console.error('❌ Error al listar usuarios:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}

listUsers();
