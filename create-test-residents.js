import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestResidents() {
  try {
    console.log('🏠 Creando residentes de prueba...\n');
    
    // Obtener un usuario admin para asignar como creador
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.error('❌ No se encontró un usuario admin');
      return;
    }
    
    console.log(`👤 Usando usuario admin: ${adminUser.username || adminUser.email}`);
    
    // Obtener departamentos disponibles
    const departamentos = await prisma.departamentos.findMany({
      include: {
        torre: true,
        nivel: true,
        companeros: true
      }
    });
    
    console.log(`📊 Departamentos encontrados: ${departamentos.length}`);
    
    // Filtrar departamentos sin residentes
    const departamentosSinResidentes = departamentos.filter(dept => 
      !dept.companeros || dept.companeros.length === 0
    );
    
    console.log(`📊 Departamentos sin residentes: ${departamentosSinResidentes.length}`);
    
    // Crear residentes para algunos departamentos
    const nombresEjemplo = [
      { nombre: 'Juan Carlos', apellidos: 'García López' },
      { nombre: 'María Elena', apellidos: 'Rodríguez Pérez' },
      { nombre: 'José Luis', apellidos: 'Martínez González' },
      { nombre: 'Ana Isabel', apellidos: 'Hernández Morales' },
      { nombre: 'Carlos Alberto', apellidos: 'Jiménez Ruiz' },
      { nombre: 'Patricia', apellidos: 'Flores Castillo' },
      { nombre: 'Miguel Ángel', apellidos: 'Vargas Silva' },
      { nombre: 'Rosa María', apellidos: 'Guerrero Méndez' }
    ];
    
    for (let i = 0; i < Math.min(6, departamentosSinResidentes.length); i++) {
      const dept = departamentosSinResidentes[i];
      const ejemplo = nombresEjemplo[i] || { nombre: `Residente${i + 1}`, apellidos: `Apellido${i + 1}` };
      
      const companero = await prisma.companeros.create({
        data: {
          nombre: ejemplo.nombre,
          apellidos: ejemplo.apellidos,
          fecha_nacimiento: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          no_personas: 2 + Math.floor(Math.random() * 4), // 2-5 personas
          no_des_per: Math.random() < 0.2 ? 1 : 0, // 20% probabilidad de tener personas con discapacidad
          recibo_apoyo: Math.random() < 0.3 ? 'SI' : 'NO', // 30% probabilidad de recibir apoyo
          no_apoyo: Math.random() < 0.3 ? Math.floor(Math.random() * 1000) + 1000 : null,
          departamento: {
            connect: {
              id_departamento: dept.id_departamento
            }
          },
          createdBy: {
            connect: {
              id: adminUser.id
            }
          },
          estatus: Math.random() < 0.9 ? 'ACTIVO' : 'INACTIVO' // 90% activos
        }
      });
      
      // Crear información financiera para algunos residentes
      if (Math.random() < 0.7) { // 70% tendrán información financiera
        await prisma.info_Financiero.create({
          data: {
            companero: {
              connect: {
                id_companero: companero.id_companero
              }
            },
            deuda: Math.floor(Math.random() * 5000).toString(), // Deuda aleatoria 0-5000
            aportacion: (500 + Math.floor(Math.random() * 1000)).toString(), // Aportación 500-1500
            comentarios: `Información financiera de ${companero.nombre}`
          }
        });
      }
      
      console.log(`✅ Residente creado: ${companero.nombre} ${companero.apellidos} en Torre ${dept.torre?.letra || 'Sin torre'}, Depto ${dept.nombre}`);
    }
    
    console.log('\n✅ Residentes de prueba creados exitosamente');
    
    // Mostrar resumen final
    const torresConResidentes = await prisma.torres.findMany({
      include: {
        niveles: {
          include: {
            departamentos: {
              include: {
                companeros: true
              }
            }
          }
        }
      }
    });
    
    console.log('\n📊 RESUMEN FINAL:');
    torresConResidentes.forEach((torre) => {
      const totalResidentes = torre.niveles.reduce((total, nivel) => 
        total + nivel.departamentos.reduce((subTotal, dept) => 
          subTotal + dept.companeros.length, 0), 0);
      console.log(`  Torre ${torre.letra}: ${totalResidentes} residentes`);
    });
    
  } catch (error) {
    console.error('❌ Error creando residentes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestResidents();
