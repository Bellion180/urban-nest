import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...');

  try {
    // 1. Crear usuario administrador
    console.log('👤 Creando usuario administrador...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@urbannest.com' },
      update: {},
      create: {
        email: 'admin@urbannest.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN'
      }
    });
    console.log('✅ Usuario administrador creado:', admin.email);

    // 2. Crear torres
    console.log('🏢 Creando torres...');
    const torres = [
      { letra: 'A', nivel: 'Nivel 1' },
      { letra: 'B', nivel: 'Nivel 1' },
      { letra: 'C', nivel: 'Nivel 1' }
    ];

    const torresCreadas = [];
    for (const torreData of torres) {
      const torre = await prisma.torres.upsert({
        where: { letra: torreData.letra },
        update: {},
        create: torreData
      });
      torresCreadas.push(torre);
      console.log(`✅ Torre ${torre.letra} creada`);
    }

    // 3. Crear departamentos
    console.log('🏠 Creando departamentos...');
    const departamentosData = [
      // Torre A
      { no_departamento: '101', id_torre: torresCreadas[0].id_torre },
      { no_departamento: '102', id_torre: torresCreadas[0].id_torre },
      { no_departamento: '103', id_torre: torresCreadas[0].id_torre },
      // Torre B
      { no_departamento: '201', id_torre: torresCreadas[1].id_torre },
      { no_departamento: '202', id_torre: torresCreadas[1].id_torre },
      { no_departamento: '203', id_torre: torresCreadas[1].id_torre },
      // Torre C
      { no_departamento: '301', id_torre: torresCreadas[2].id_torre },
      { no_departamento: '302', id_torre: torresCreadas[2].id_torre }
    ];

    const departamentosCreados = [];
    for (const deptoData of departamentosData) {
      try {
        const departamento = await prisma.departamentos.create({
          data: deptoData,
          include: { torre: true }
        });
        departamentosCreados.push(departamento);
        console.log(`✅ Departamento ${departamento.no_departamento} creado en Torre ${departamento.torre.letra}`);
      } catch (error) {
        if (error.code !== 'P2002') { // Ignorar duplicados
          console.error(`❌ Error creando departamento ${deptoData.no_departamento}:`, error);
        }
      }
    }

    // 4. Crear compañeros de ejemplo
    console.log('👥 Creando compañeros de ejemplo...');
    const companerosData = [
      {
        nombre: 'Juan',
        apellidos: 'Pérez García',
        fecha_nacimiento: new Date('1985-03-15'),
        no_personas: 4,
        no_des_per: 0,
        recibo_apoyo: 'SI',
        no_apoyo: 1500,
        id_departamento: departamentosCreados[0]?.id_departamento,
        createdById: admin.id
      },
      {
        nombre: 'María',
        apellidos: 'González López',
        fecha_nacimiento: new Date('1990-07-22'),
        no_personas: 3,
        no_des_per: 1,
        recibo_apoyo: 'SI',
        no_apoyo: 2000,
        id_departamento: departamentosCreados[1]?.id_departamento,
        createdById: admin.id
      },
      {
        nombre: 'Carlos',
        apellidos: 'Rodríguez Martínez',
        fecha_nacimiento: new Date('1978-11-08'),
        no_personas: 2,
        no_des_per: 0,
        recibo_apoyo: 'NO',
        id_departamento: departamentosCreados[2]?.id_departamento,
        createdById: admin.id
      },
      {
        nombre: 'Ana',
        apellidos: 'Silva Hernández',
        fecha_nacimiento: new Date('1992-05-12'),
        no_personas: 5,
        no_des_per: 2,
        recibo_apoyo: 'SI',
        no_apoyo: 2500,
        id_departamento: departamentosCreados[3]?.id_departamento,
        createdById: admin.id
      }
    ];

    const companerosCreados = [];
    for (const companeroData of companerosData) {
      if (companeroData.id_departamento) {
        const companero = await prisma.companeros.create({
          data: companeroData,
          include: {
            departamento: {
              include: { torre: true }
            }
          }
        });
        companerosCreados.push(companero);
        console.log(`✅ Compañero ${companero.nombre} ${companero.apellidos} creado en Depto ${companero.departamento.no_departamento}, Torre ${companero.departamento.torre.letra}`);
      }
    }

    // 5. Crear información financiera para algunos compañeros
    console.log('💰 Creando información financiera...');
    for (let i = 0; i < Math.min(companerosCreados.length, 3); i++) {
      const companero = companerosCreados[i];
      const infoFinanciero = await prisma.info_Financiero.create({
        data: {
          excelente: 'SI',
          aport: '5000',
          deuda: '15000',
          estacionamiento: i % 2 === 0 ? 'SI' : 'NO',
          aportacion: '1500',
          aportacion_deuda: '500',
          apoyo_renta: companero.recibo_apoyo,
          comentarios: `Información financiera para ${companero.nombre} ${companero.apellidos}`,
          id_companeros: companero.id_companero
        }
      });
      console.log(`✅ Info financiera creada para ${companero.nombre} ${companero.apellidos}`);
    }

    // 6. Crear algunos registros financieros
    console.log('📊 Creando registros financieros...');
    for (let i = 0; i < companerosCreados.length; i++) {
      const companero = companerosCreados[i];
      await prisma.financieros.create({
        data: {
          validez: 'PAGADO',
          aportaciones: (1000 + i * 500).toString(),
          facturas: `FACT-${2024}-${(i + 1).toString().padStart(3, '0')}`,
          salidas: (i * 100).toString(),
          id_companeros: companero.id_companero
        }
      });
      console.log(`✅ Registro financiero creado para ${companero.nombre} ${companero.apellidos}`);
    }

    console.log('🎉 Seeding completado exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - ${torresCreadas.length} torres creadas`);
    console.log(`   - ${departamentosCreados.length} departamentos creados`);
    console.log(`   - ${companerosCreados.length} compañeros creados`);
    console.log(`   - 1 usuario administrador creado`);

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
