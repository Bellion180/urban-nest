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

// Obtener edificio por ID con sus pisos, apartamentos y residentes
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const building = await prisma.building.findUnique({
      where: { id },
      include: {
        floors: {
          include: {
            apartments: {
              include: {
                residents: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: {
            number: 'asc'
          }
        }
      }
    });

    if (!building) {
      return res.status(404).json({ error: 'Edificio no encontrado' });
    }

    // Formatear datos para el frontend
    const formattedBuilding = {
      id: building.id,
      name: building.name,
      description: building.description,
      address: building.address,
      image: building.image,
      floors: building.floors.map(floor => ({
        id: floor.id,
        name: floor.name,
        number: floor.number,
        apartments: floor.apartments.map(apt => ({
          id: apt.id,
          number: apt.number,
          area: apt.area,
          bedrooms: apt.bedrooms,
          bathrooms: apt.bathrooms,
          residents: apt.residents
        }))
      }))
    };

    res.json(formattedBuilding);
  } catch (error) {
    console.error('Error al obtener edificio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo edificio
router.post('/', async (req, res) => {
  try {
    const { name, description, image, floors } = req.body;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Validar campos requeridos
    if (!name || !description) {
      return res.status(400).json({ error: 'Nombre y descripción son requeridos' });
    }

    // Datos base del edificio
    const buildingData = {
      name,
      description,
      image: image || '/placeholder-building.jpg'
    };

    // Si se proporcionan pisos, incluirlos en la creación
    if (floors && Array.isArray(floors) && floors.length > 0) {
      buildingData.floors = {
        create: floors.map(floor => ({
          name: floor.name,
          number: floor.number,
          apartments: {
            create: (floor.apartments || []).map(aptNumber => ({
              number: aptNumber
            }))
          }
        }))
      };
    }

    const building = await prisma.building.create({
      data: buildingData,
      include: {
        floors: {
          include: {
            apartments: true
          },
          orderBy: {
            number: 'asc'
          }
        }
      }
    });

    // Formatear respuesta similar a GET
    const formattedBuilding = {
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
      totalResidents: 0
    };

    res.status(201).json({
      message: 'Edificio creado exitosamente',
      building: formattedBuilding
    });
  } catch (error) {
    console.error('Error al crear edificio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Test endpoint
router.put('/test/:id', async (req, res) => {
  console.log('TEST PUT endpoint hit');
  res.json({ message: 'Test PUT successful', id: req.params.id });
});

// Actualizar edificio
router.put('/:id', (req, res) => {
  console.log('PUT endpoint reached - VERY SIMPLE VERSION');
  res.json({ message: 'PUT endpoint works', id: req.params.id });
});

// Eliminar edificio
router.delete('/:id', async (req, res) => {
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
