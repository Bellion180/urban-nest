import express from 'express';
import { prisma } from '../../src/lib/prisma.js';

const router = express.Router();

console.log('🏗️ Cargando rutas de niveles...');

// Obtener todos los niveles de una torre
router.get('/torre/:torreId', async (req, res) => {
  try {
    const { torreId } = req.params;
    
    console.log(`🔍 API: Obteniendo niveles de torre ${torreId}`);
    
    const niveles = await prisma.niveles.findMany({
      where: {
        id_torre: torreId
      },
      include: {
        departamentos: {
          include: {
            departamento: {
              include: {
                companeros: true
              }
            }
          }
        }
      },
      orderBy: {
        numero: 'asc'
      }
    });

    // Mapear niveles para incluir información de departamentos
    const nivelesConInfo = niveles.map(nivel => ({
      id: nivel.id_nivel,
      numero: nivel.numero,
      nombre: nivel.nombre,
      departamentos: nivel.departamentos.map(rel => ({
        ...rel.departamento,
        companeros: rel.departamento.companeros
      }))
    }));

    console.log(`✅ API: Encontrados ${niveles.length} niveles`);
    res.json(nivelesConInfo);
    
  } catch (error) {
    console.error('❌ API Error al obtener niveles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo nivel para una torre
router.post('/torre/:torreId', async (req, res) => {
  try {
    const { torreId } = req.params;
    const { numero, nombre } = req.body;
    
    console.log(`➕ API: Creando nivel ${numero} en torre ${torreId}`);
    
    // Verificar que no exista un nivel con el mismo número en esta torre
    const nivelExistente = await prisma.niveles.findFirst({
      where: {
        id_torre: torreId,
        numero: numero
      }
    });

    if (nivelExistente) {
      return res.status(400).json({ 
        error: `Ya existe un nivel ${numero} en esta torre` 
      });
    }

    const nuevoNivel = await prisma.niveles.create({
      data: {
        numero,
        nombre: nombre || `Nivel ${numero}`,
        id_torre: torreId
      }
    });

    console.log(`✅ API: Nivel creado con ID ${nuevoNivel.id_nivel}`);
    res.status(201).json(nuevoNivel);
    
  } catch (error) {
    console.error('❌ API Error al crear nivel:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar un nivel
router.delete('/:nivelId', async (req, res) => {
  try {
    const { nivelId } = req.params;
    
    console.log(`🗑️ API: Eliminando nivel ${nivelId}`);
    
    // Verificar que no tenga departamentos asignados
    const departamentosEnNivel = await prisma.departamentosNivel.findMany({
      where: {
        id_nivel: nivelId
      }
    });

    if (departamentosEnNivel.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar un nivel que tiene departamentos asignados' 
      });
    }

    await prisma.niveles.delete({
      where: {
        id_nivel: nivelId
      }
    });

    console.log(`✅ API: Nivel eliminado`);
    res.json({ message: 'Nivel eliminado exitosamente' });
    
  } catch (error) {
    console.error('❌ API Error al eliminar nivel:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

console.log('✅ Rutas de niveles cargadas exitosamente');

export { router as nivelesRoutes };
