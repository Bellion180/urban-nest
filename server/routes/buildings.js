import express from 'express';
import { prisma } from '../../src/lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para guardar imágenes en carpeta por edificio
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Para imágenes de edificio
    if (req.route.path === '/') {
      const dir = path.join('public', 'edificios', 'temp');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    }
    // Para imágenes de pisos
    else if (req.route.path === '/:id/pisos/:pisoNumber/image') {
      const { id, pisoNumber } = req.params;
      const dir = path.join('public', 'edificios', id.toString(), 'pisos', pisoNumber.toString());
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    }
    else {
      cb(new Error('Ruta no válida para subida de archivos'), null);
    }
  },
  filename: function (req, file, cb) {
    // Para pisos, usar nombre fijo
    if (req.route.path === '/:id/pisos/:pisoNumber/image') {
      cb(null, 'piso' + path.extname(file.originalname));
    } else {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  }
});
const upload = multer({ storage });
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
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('=== POST /buildings ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user);
    
    const { name, description, floors } = req.body;
    let imagePath = '/placeholder-building.jpg';
    
    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      console.log('Error: Usuario no es admin');
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Validar campos requeridos
    if (!name || !description) {
      console.log('Error: Campos requeridos faltantes');
      return res.status(400).json({ error: 'Nombre y descripción son requeridos' });
    }

    // Procesar imagen si se envió
    if (req.file) {
      imagePath = `/edificios/temp/${req.file.filename}`;
      console.log('Imagen procesada:', imagePath);
    }

    // Datos base del edificio
    const buildingData = {
      name,
      description,
      image: imagePath
    };

    // Si se proporcionan pisos, incluirlos en la creación
    if (floors && typeof floors === 'string') {
      try {
        const parsedFloors = JSON.parse(floors);
        console.log('Pisos parseados:', parsedFloors);
        if (Array.isArray(parsedFloors) && parsedFloors.length > 0) {
          buildingData.floors = {
            create: parsedFloors.map(floor => ({
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
      } catch (parseError) {
        console.error('Error parsing floors:', parseError);
      }
    }

    console.log('BuildingData a crear:', JSON.stringify(buildingData, null, 2));

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

    console.log('Edificio creado:', building.id);

    // Mover imagen a carpeta definitiva del edificio
    if (req.file) {
      const oldPath = path.join('public', 'edificios', 'temp', req.file.filename);
      const newDir = path.join('public', 'edificios', building.id.toString());
      if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });
      const newPath = path.join(newDir, req.file.filename);
      fs.renameSync(oldPath, newPath);
      
      // Actualizar la ruta de la imagen en la base de datos
      await prisma.building.update({
        where: { id: building.id },
        data: { image: `/edificios/${building.id}/${req.file.filename}` }
      });
      imagePath = `/edificios/${building.id}/${req.file.filename}`;
      console.log('Imagen movida a:', imagePath);
    }

    // Formatear respuesta similar a GET
    const formattedBuilding = {
      id: building.id,
      name: building.name,
      description: building.description,
      image: imagePath,
      floors: building.floors.map(floor => ({
        id: floor.id,
        name: floor.name,
        number: floor.number,
        apartments: floor.apartments.map(apt => apt.number)
      })),
      totalApartments: building.floors.reduce((total, floor) => total + floor.apartments.length, 0),
      totalResidents: 0
    };

    console.log('Respuesta formateada:', formattedBuilding);

    res.status(201).json({
      message: 'Edificio creado exitosamente',
      building: formattedBuilding
    });
  } catch (error) {
    console.error('Error al crear edificio:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Endpoint para obtener imágenes de pisos de un edificio
router.get('/:id/pisos/imagenes', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`=== GET /buildings/${id}/pisos/imagenes ===`);
    
    const building = await prisma.building.findUnique({
      where: { id },
      include: { floors: true }
    });

    if (!building) {
      return res.status(404).json({ error: 'Edificio no encontrado' });
    }

    const floorImages = [];
    const buildingDir = path.join('public', 'edificios', id, 'pisos');
    
    if (fs.existsSync(buildingDir)) {
      for (const floor of building.floors) {
        const floorDir = path.join(buildingDir, floor.number.toString());
        if (fs.existsSync(floorDir)) {
          const files = fs.readdirSync(floorDir);
          const imageFile = files.find(file => 
            file.toLowerCase().startsWith('piso.') && 
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
          );
          
          if (imageFile) {
            floorImages.push({
              pisoNumber: floor.number,
              pisoName: floor.name,
              imageUrl: `/edificios/${id}/pisos/${floor.number}/${imageFile}`
            });
          }
        }
      }
    }

    res.json({ buildingId: id, floorImages });
  } catch (error) {
    console.error('Error al obtener imágenes de pisos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para subir imagen de piso
router.post('/:id/pisos/:pisoNumber/image', upload.single('image'), async (req, res) => {
  try {
    const { id, pisoNumber } = req.params;
    console.log(`=== POST /buildings/${id}/pisos/${pisoNumber}/image ===`);
    console.log('User:', req.user);
    console.log('File:', req.file);
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió imagen' });
    }
    
    // La imagen se guarda automáticamente en: public/edificios/[id]/pisos/[pisoNumber]/piso.jpg
    const imagePath = `/edificios/${id}/pisos/${pisoNumber}/${req.file.filename}`;
    
    console.log('Imagen de piso guardada en:', imagePath);
    res.json({ 
      message: 'Imagen de piso subida correctamente', 
      image: imagePath,
      buildingId: id,
      pisoNumber: parseInt(pisoNumber)
    });
  } catch (error) {
    console.error('Error al subir imagen de piso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar edificio
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('=== PUT /buildings/:id ===');
    const { id } = req.params;
    const { name, description, floors } = req.body;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Validar campos requeridos
    if (!name || !description) {
      return res.status(400).json({ error: 'Nombre y descripción son requeridos' });
    }

    // Obtener el edificio actual
    const existingBuilding = await prisma.building.findUnique({
      where: { id },
      include: {
        floors: {
          include: {
            apartments: true
          }
        }
      }
    });

    if (!existingBuilding) {
      return res.status(404).json({ error: 'Edificio no encontrado' });
    }

    try {
      // Actualizar edificio base y sus pisos
      const updatedBuilding = await prisma.building.update({
        where: { id },
        data: {
          name,
          description,
          floors: {
            // Eliminar pisos que ya no existen en la nueva configuración
            deleteMany: {
              id: {
                notIn: floors.filter(f => !f.id.startsWith('temp-')).map(f => f.id)
              }
            },
            // Actualizar pisos existentes y crear nuevos
            upsert: floors.map(floor => ({
              where: {
                id: floor.id.startsWith('temp-') ? 'dummy-id' : floor.id
              },
              create: {
                name: floor.name,
                number: floor.number,
                apartments: {
                  create: floor.apartments.map(aptNumber => ({
                    number: aptNumber
                  }))
                }
              },
              update: {
                name: floor.name,
                number: floor.number,
                apartments: {
                  deleteMany: {},
                  create: floor.apartments.map(aptNumber => ({
                    number: aptNumber
                  }))
                }
              }
            }))
          }
        },
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
        }
      });

      // Formatear la respuesta
      const formattedBuilding = {
        id: updatedBuilding.id,
        name: updatedBuilding.name,
        description: updatedBuilding.description,
        image: updatedBuilding.image,
        floors: updatedBuilding.floors.map(floor => ({
          id: floor.id,
          name: floor.name,
          number: floor.number,
          apartments: floor.apartments.map(apt => apt.number)
        })),
        totalApartments: updatedBuilding.floors.reduce((total, floor) => total + floor.apartments.length, 0),
        totalResidents: updatedBuilding._count.residents
      };

      res.json(formattedBuilding);

    } catch (error) {
      console.error('Error específico al actualizar:', error);
      throw error;
    }
    
    console.log('ID:', id);
    console.log('Body:', req.body);
    console.log('User:', req.user);

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      console.log('Access denied - user role:', req.user.role);
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    console.log('Admin check passed');

    // Si solo se actualizan datos básicos (sin floors)
    if (!floors || floors.length === 0) {
      console.log('Updating basic data only');
      const building = await prisma.building.update({
        where: { id },
        data: {
          name,
          description
        },
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

      console.log('Building updated successfully');
      return res.json({
        message: 'Edificio actualizado exitosamente',
        building
      });
    }

    console.log('Updating with floors');
    // Si se actualizan floors también (actualización completa)
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

    // Actualizar edificio con nuevos datos y floors
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
              create: (floor.apartments || []).map(aptNumber => ({
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
          },
          orderBy: {
            number: 'asc'
          }
        }
      }
    });

    console.log('Building with floors updated successfully');
    res.json({
      message: 'Edificio actualizado exitosamente',
      building
    });
  } catch (error) {
    console.error('Error al actualizar edificio:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Eliminar edificio
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`=== DELETE /buildings/${id} ===`);

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

    // Eliminar imágenes físicas del edificio antes de eliminar de la base de datos
    const buildingDir = path.join('public', 'edificios', id);
    if (fs.existsSync(buildingDir)) {
      console.log(`Eliminando carpeta de imágenes: ${buildingDir}`);
      try {
        // Eliminar toda la carpeta del edificio recursivamente
        fs.rmSync(buildingDir, { recursive: true, force: true });
        console.log(`Carpeta eliminada exitosamente: ${buildingDir}`);
      } catch (fileError) {
        console.error('Error al eliminar carpeta de imágenes:', fileError);
        // Continúa con la eliminación de la base de datos aunque falle la eliminación de archivos
      }
    } else {
      console.log(`No se encontró carpeta de imágenes para el edificio: ${buildingDir}`);
    }

    // Eliminar edificio de la base de datos
    await prisma.building.delete({
      where: { id }
    });

    console.log(`Edificio ${id} eliminado exitosamente`);
    res.json({
      message: 'Edificio e imágenes eliminados exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar edificio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
