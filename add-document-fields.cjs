const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDocumentFields() {
  console.log('🔄 Agregando campos de documentos a la tabla companeros...');
  
  try {
    // Primero verificamos si los campos ya existen
    const companeroExample = await prisma.companeros.findFirst();
    
    if (companeroExample) {
      console.log('📊 Estructura actual del companero:', Object.keys(companeroExample));
      
      // Los campos se agregarán via SQL directo ya que Prisma requiere migración
      console.log('📋 Ejecutando SQL para agregar campos de documentos...');
      
      const alterCommands = [
        'ALTER TABLE companeros ADD COLUMN documentos JSON DEFAULT NULL',
        'ALTER TABLE companeros ADD COLUMN documentoIne VARCHAR(500) DEFAULT NULL',
        'ALTER TABLE companeros ADD COLUMN documentoCurp VARCHAR(500) DEFAULT NULL',
        'ALTER TABLE companeros ADD COLUMN documentoComprobanteDomicilio VARCHAR(500) DEFAULT NULL',
        'ALTER TABLE companeros ADD COLUMN documentoActaNacimiento VARCHAR(500) DEFAULT NULL'
      ];
      
      for (const command of alterCommands) {
        try {
          await prisma.$executeRawUnsafe(command);
          console.log('✅ Ejecutado:', command.split('ADD COLUMN')[1]?.split(' ')[1] || command);
        } catch (error) {
          if (error.message.includes('Duplicate column name')) {
            console.log('ℹ️ Campo ya existe:', command.split('ADD COLUMN')[1]?.split(' ')[1] || 'campo');
          } else {
            console.error('❌ Error en comando:', error.message);
          }
        }
      }
      
    } else {
      console.log('⚠️ No se encontraron compañeros para verificar estructura');
    }
    
    console.log('✅ Proceso completado');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addDocumentFields();
}

module.exports = { addDocumentFields };
