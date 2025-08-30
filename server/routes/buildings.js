import express from 'express';
import { prisma } from '../../src/lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los edificios con sus pisos y apartamentos
router.get('/', async (req, res) => {
  try {
    const buildings = await prisma.building.findMany({
      include: {
        floors: {
          include: {
            apartments: true
          },
          orderBy: {
            number: 'asc'
          }
        },
        _count: {
          select: {
            residents: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Formatear datos para el frontend
    const formattedBuildings = buildings.map(building => ({
      id: building.id,
      name: building.name,
      description: building.description,
      image: building.image,
      floors: building.floors.map(floor => ({
        id: floor.id,
        name: floor.name,
        number: floor.number,
        apartments: floor.apartments.map(apt => apt.number)
      })),
      totalApartments: building.floors.reduce((total, floor) => total + floor.apartments.length, 0),
      totalResidents: building._count.residents
    }));

    res.json(formattedBuildings);
  } catch (error) {
    console.error('Error al obtener edificios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo edificio
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, image, floors } = req.body;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const building = await prisma.building.create({
      data: {
        name,
        description,
        image: image || '/placeholder-building.jpg',
        floors: {
          create: floors.map(floor => ({
            name: floor.name,
            number: floor.number,
            apartments: {
              create: floor.apartments.map(aptNumber => ({
                number: aptNumber
              }))
            }
          }))
        }
      },
      include: {
        floors: {
          include: {
            apartments: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Edificio creado exitosamente',
      building
    });
  } catch (error) {
    console.error('Error al crear edificio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar edificio
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, floors } = req.body;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Eliminar pisos y apartamentos existentes
    await prisma.apartment.deleteMany({
      where: {
        floor: {
          buildingId: id
        }
      }
    });

    await prisma.floor.deleteMany({
      where: {
        buildingId: id
      }
    });

    // Actualizar edificio con nuevos datos
    const building = await prisma.building.update({
      where: { id },
      data: {
        name,
        description,
        floors: {
          create: floors.map(floor => ({
            name: floor.name,
            number: floor.number || floors.indexOf(floor) + 1,
            apartments: {
              create: floor.apartments.map(aptNumber => ({
                number: aptNumber
              }))
            }
          }))
        }
      },
      include: {
        floors: {
          include: {
            apartments: true
          }
        }
      }
    });

    res.json({
      message: 'Edificio actualizado exitosamente',
      building
    });
  } catch (error) {
    console.error('Error al actualizar edificio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar edificio
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Verificar si hay residentes en el edificio
    const residentsCount = await prisma.resident.count({
      where: { buildingId: id }
    });

    if (residentsCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el edificio porque tiene residentes registrados' 
      });
    }

    await prisma.building.delete({
      where: { id }
    });

    res.json({
      message: 'Edificio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar edificio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
