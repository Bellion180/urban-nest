// Script para poblar torres, niveles y departamentos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Crear una torre
  const torre = await prisma.torres.create({
    data: {
      letra: 'A',
      descripcion: 'Torre principal',
      niveles: {
        create: [
          {
            nombre: 'Nivel 1',
            numero: 1,
            departamentos: {
              create: [
                { nombre: 'Depto 101', descripcion: 'Departamento 101' },
                { nombre: 'Depto 102', descripcion: 'Departamento 102' }
              ]
            }
          },
          {
            nombre: 'Nivel 2',
            numero: 2,
            departamentos: {
              create: [
                { nombre: 'Depto 201', descripcion: 'Departamento 201' },
                { nombre: 'Depto 202', descripcion: 'Departamento 202' }
              ]
            }
          }
        ]
      }
    }
  });
  console.log('Torre creada:', torre);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
