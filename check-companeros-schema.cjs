const { PrismaClient } = require('@prisma/client');

async function checkCompanerosSchema() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔍 Verificando esquema de companeros...');
        
        // Intentar hacer una query SELECT con los campos que necesitamos
        const testCompanero = await prisma.companeros.findFirst({
            select: {
                id_companero: true,
                nombre: true,
                profilePhoto: true,
                documentos: true,
                documentoIne: true,
                documentoCurp: true,
                documentoComprobanteDomicilio: true,
                documentoActaNacimiento: true
            }
        });
        
        console.log('✅ Todos los campos existen en la base de datos');
        console.log('📊 Ejemplo de registro:', testCompanero);
        
    } catch (error) {
        console.error('❌ Error al acceder campos:', error.message);
        
        // Intentar un SELECT básico para ver qué campos existen
        try {
            const basicSelect = await prisma.companeros.findFirst();
            console.log('📋 Campos disponibles:', Object.keys(basicSelect || {}));
        } catch (basicError) {
            console.error('❌ Error básico:', basicError.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

checkCompanerosSchema();
