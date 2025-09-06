import express from 'express';
import { prisma } from '../../src/lib/prisma.js';

const router = express.Router();

console.log('🏠 Cargando rutas de torres...');

// Obtener todas las torres
router.get('/', async (req, res) => {
  try {
    const torres = await prisma.torres.findMany({
      include: {
        departamentos: {
          include: {
            companeros: true
          }
        }
      },
      orderBy: {
        letra: 'asc'
      }
    });

    // Mapear para compatibilidad con estructura anterior
    const mappedBuildings = torres.map(torre => ({
      id: torre.id_torre,
      name: torre.letra,
      description: torre.nivel,
      image: null,
      createdAt: torre.createdAt,
      updatedAt: torre.updatedAt,
      floors: [{
        id: torre.id_torre,
        name: torre.nivel || 'Nivel 1',
        number: 1,
        buildingId: torre.id_torre,
        apartments: torre.departamentos.map(dept => dept.no_departamento)
      }],
      _count: {
        residents: torre.departamentos.reduce((total, dept) => total + dept.companeros.length, 0)
      }
    }));

    res.json(mappedBuildings);
  } catch (error) {
    console.error('Error al obtener torres:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva torre
router.post('/', async (req, res) => {
  try {
    const { letra, nivel } = req.body;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (!letra) {
      return res.status(400).json({ error: 'La letra de la torre es requerida' });
    }

    const torre = await prisma.torres.create({
      data: {
        letra,
        nivel: nivel || 'Nivel 1'
      }
    });

    res.status(201).json({
      message: 'Torre creada exitosamente',
      torre
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe una torre con esa letra' });
    }
    console.error('Error al crear torre:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear departamento en una torre
router.post('/:torreId/departamentos', async (req, res) => {
  try {
    const { torreId } = req.params;
    const { no_departamento } = req.body;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (!no_departamento) {
      return res.status(400).json({ error: 'El número de departamento es requerido' });
    }

    // Verificar que la torre existe
    const torre = await prisma.torres.findUnique({
      where: { id_torre: torreId }
    });

    if (!torre) {
      return res.status(404).json({ error: 'Torre no encontrada' });
    }

    const departamento = await prisma.departamentos.create({
      data: {
        no_departamento,
        id_torre: torreId
      },
      include: {
        torre: true
      }
    });

    res.status(201).json({
      message: 'Departamento creado exitosamente',
      departamento
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe un departamento con ese número en esta torre' });
    }
    console.error('Error al crear departamento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener departamentos de una torre
router.get('/:torreId/departamentos', async (req, res) => {
  try {
    const { torreId } = req.params;

    const departamentos = await prisma.departamentos.findMany({
      where: { id_torre: torreId },
      include: {
        torre: true,
        companeros: true
      },
      orderBy: {
        no_departamento: 'asc'
      }
    });

    res.json(departamentos);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar torre
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Verificar si tiene compañeros asignados
    const companeros = await prisma.companeros.findMany({
      where: {
        departamento: {
          id_torre: id
        }
      }
    });

    if (companeros.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la torre porque tiene compañeros asignados',
        companeros: companeros.length
      });
    }

    await prisma.torres.delete({
      where: { id_torre: id }
    });

    res.json({
      message: 'Torre eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar torre:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

console.log('✅ Rutas de torres cargadas exitosamente');

export { router as torresRoutes };
