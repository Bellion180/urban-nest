// Script para agregar un usuario admin para login (CommonJS)
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@urban-nest.com';
  const password = 'admin123'; // Cambia por una contraseña segura
  const name = 'Administrador';

  // Verifica si ya existe
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('El usuario admin ya existe.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
  console.log('Usuario admin creado:', user);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
