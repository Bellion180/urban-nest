import { PrismaClient } from '@prisma/client';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

async function validateSetup() {
  console.log('🔍 Urban Nest - Validación de Configuración\n');

  const checks = [
    {
      name: 'Archivo .env',
      check: () => existsSync('.env'),
      fix: 'Ejecuta: copy .env.example .env'
    },
    {
      name: 'Conexión a Base de Datos',
      check: async () => {
        try {
          await prisma.$connect();
          return true;
        } catch {
          return false;
        }
      },
      fix: 'Ejecuta: npm run docker:up && npm run db:setup'
    },
    {
      name: 'Usuarios de Prueba',
      check: async () => {
        try {
          const userCount = await prisma.user.count();
          return userCount > 0;
        } catch {
          return false;
        }
      },
      fix: 'Ejecuta: npm run db:seed'
    },
    {
      name: 'Schema Prisma',
      check: async () => {
        try {
          await prisma.user.findFirst();
          return true;
        } catch {
          return false;
        }
      },
      fix: 'Ejecuta: npx prisma db push'
    }
  ];

  let allPassed = true;

  for (const check of checks) {
    process.stdout.write(`📋 ${check.name}... `);
    
    try {
      const result = await check.check();
      if (result) {
        console.log('✅');
      } else {
        console.log('❌');
        console.log(`   💡 Solución: ${check.fix}`);
        allPassed = false;
      }
    } catch (error) {
      console.log('❌');
      console.log(`   ⚠️ Error: ${error.message}`);
      console.log(`   💡 Solución: ${check.fix}`);
      allPassed = false;
    }
  }

  console.log('');

  if (allPassed) {
    console.log('🎉 ¡Todo está configurado correctamente!');
    console.log('');
    console.log('🚀 Para iniciar la aplicación:');
    console.log('   1. npm run server     (Backend en puerto 3001)');
    console.log('   2. npm run dev        (Frontend en puerto 8080+)');
    console.log('   3. Abrir http://localhost:8080+ en tu navegador');
    console.log('');
    console.log('🔑 Credenciales de prueba:');
    console.log('   admin@urbannest.com / admin123');
    console.log('   user@urbannest.com / user123');
    console.log('   resident@urbannest.com / resident123');
  } else {
    console.log('⚠️ Hay problemas de configuración que necesitan solución.');
    console.log('');
    console.log('🛠️ Configuración rápida:');
    console.log('   npm run setup    # Configuración automática completa');
  }

  await prisma.$disconnect();
}

validateSetup().catch(console.error);
