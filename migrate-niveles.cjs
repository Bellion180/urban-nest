const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateToNiveles() {
  console.log('🔄 Migrando torres existentes para agregar niveles...');

  try {
    // Obtener todas las torres
    const torres = await prisma.torres.findMany({
      include: {
        departamentos: true
      }
    });

    console.log(`📋 Encontradas ${torres.length} torres`);

    for (const torre of torres) {
      console.log(`\n🏢 Procesando Torre ${torre.nombre}...`);
      
      // Crear niveles basados en los departamentos existentes
      // Extraer números de piso de los números de departamento
      const numerosDepto = torre.departamentos.map(dept => {
        // Asumir que el primer dígito del número de departamento es el piso
        const numeroCompleto = dept.no_departamento;
        const primerDigito = parseInt(numeroCompleto.charAt(0));
        return primerDigito || 1; // Default a piso 1 si no se puede determinar
      });

      // Obtener niveles únicos
      const nivelesUnicos = [...new Set(numerosDepto)].sort();
      
      console.log(`   📊 Niveles detectados: ${nivelesUnicos.join(', ')}`);

      // Crear los niveles
      for (const numeroNivel of nivelesUnicos) {
        const nivelExistente = await prisma.niveles.findFirst({
          where: {
            id_torre: torre.id_torre,
            numero: numeroNivel
          }
        });

        if (!nivelExistente) {
          const nivel = await prisma.niveles.create({
            data: {
              numero: numeroNivel,
              nombre: `Nivel ${numeroNivel}`,
              id_torre: torre.id_torre
            }
          });

          console.log(`   ✅ Creado nivel ${numeroNivel} (ID: ${nivel.id_nivel})`);

          // Relacionar departamentos con este nivel
          const departamentosDeEstePiso = torre.departamentos.filter(dept => {
            const primerDigito = parseInt(dept.no_departamento.charAt(0));
            return (primerDigito || 1) === numeroNivel;
          });

          for (const dept of departamentosDeEstePiso) {
            await prisma.departamentosNivel.create({
              data: {
                id_departamento: dept.id_departamento,
                id_nivel: nivel.id_nivel
              }
            });
            console.log(`     🔗 Departamento ${dept.no_departamento} vinculado al nivel ${numeroNivel}`);
          }
        } else {
          console.log(`   ⚡ Nivel ${numeroNivel} ya existe`);
        }
      }
    }

    console.log('\n🎉 Migración de niveles completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToNiveles();
