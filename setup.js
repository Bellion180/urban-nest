#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🏢 Urban Nest - Configuración Automática\n');

function runCommand(command, description) {
  console.log(`🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completado\n`);
  } catch (error) {
    console.log(`❌ Error en: ${description}`);
    console.log(error.message);
    process.exit(1);
  }
}

function checkPrerequisites() {
  console.log('📋 Verificando prerrequisitos...\n');
  
  try {
    execSync('node --version', { stdio: 'pipe' });
    console.log('✅ Node.js encontrado');
  } catch {
    console.log('❌ Node.js no encontrado. Instálalo desde https://nodejs.org/');
    process.exit(1);
  }

  try {
    execSync('docker --version', { stdio: 'pipe' });
    console.log('✅ Docker encontrado');
  } catch {
    console.log('❌ Docker no encontrado. Instálalo desde https://www.docker.com/');
    process.exit(1);
  }

  console.log('🎉 Todos los prerrequisitos están instalados\n');
}

async function main() {
  checkPrerequisites();

  // 1. Instalar dependencias
  runCommand('npm install', 'Instalando dependencias');

  // 2. Verificar/copiar archivo .env
  if (!existsSync('.env')) {
    if (existsSync('.env.example')) {
      runCommand('copy .env.example .env', 'Copiando archivo de configuración');
      console.log('⚠️ Revisa el archivo .env para ajustar la configuración si es necesario\n');
    } else {
      console.log('⚠️ No se encontró .env.example. Asegúrate de configurar las variables de entorno\n');
    }
  } else {
    console.log('✅ Archivo .env ya existe\n');
  }

  // 3. Iniciar Docker
  runCommand('docker-compose up -d', 'Iniciando base de datos MySQL');

  // 4. Esperar un poco para que MySQL inicie
  console.log('⏳ Esperando que MySQL inicie completamente...');
  await new Promise(resolve => setTimeout(resolve, 15000));

  // 5. Configurar Prisma
  runCommand('npx prisma generate', 'Generando cliente Prisma');
  runCommand('npx prisma db push', 'Aplicando esquema a la base de datos');

  // 6. Poblar datos de prueba
  runCommand('node seed-users.js', 'Poblando datos de prueba');

  // 7. Mensaje final
  console.log('🎉 ¡Configuración completada exitosamente!\n');
  console.log('📝 Próximos pasos:');
  console.log('   1. npm run server     # Iniciar backend');
  console.log('   2. npm run dev        # Iniciar frontend (en otra terminal)');
  console.log('   3. Abrir http://localhost:8080+ en tu navegador\n');
  
  console.log('🔑 Credenciales de prueba:');
  console.log('   admin@urbannest.com / admin123 (Administrador)');
  console.log('   user@urbannest.com / user123 (Usuario)');
  console.log('   resident@urbannest.com / resident123 (Residente)\n');
  
  console.log('🛠️ Scripts útiles:');
  console.log('   npm run dev:full      # Frontend + Backend juntos');
  console.log('   npm run db:studio     # Prisma Studio');
  console.log('   npm run docker:down   # Detener Docker');
}

main().catch(console.error);
