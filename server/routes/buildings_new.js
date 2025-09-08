import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Configuración de multer para imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { type, buildingId, floorId } = req.body;
    let uploadPath;

    if (type === 'building') {
      uploadPath = path.join('public', 'edificios', buildingId);
    } else if (type === 'floor') {
      uploadPath = path.join('public', 'edificios', buildingId, 'pisos', floorId);
    } else if (type === 'resident') {
      uploadPath = path.join('public', 'residentes');
    }

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Listar todas las torres
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('=== GET /buildings ===');
    console.log('Usuario autenticado:', req.user);

    const torres = await prisma.torres.findMany({
      include: {
        niveles: {
          include: {
            departamentos: true
          },
          orderBy: {
            numero: 'asc'
          }
        }
      },
      orderBy: {
        letra: 'asc'
      }
    });

    console.log(`Torres encontradas: ${torres.length}`);

    const formattedBuildings = torres.map(torre => ({
      id: torre.id_torre,
      name: torre.letra,
      description: torre.descripcion,
      image: torre.imagen,
      floors: torre.niveles.map(nivel => ({
        id: nivel.id_nivel,
        name: nivel.nombre,
        number: nivel.numero,
        apartments: nivel.departamentos.map(dept => dept.nombre)
      })),
      totalApartments: torre.niveles.reduce((total, nivel) => total + nivel.departamentos.length, 0),
      totalResidents: 0 // TODO: Implementar conteo de residentes
    }));

    res.json(formattedBuildings);
  } catch (error) {
    console.error('Error al obtener torres:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener torre por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`=== GET /buildings/${id} ===`);

    const torre = await prisma.torres.findUnique({
      where: { id_torre: id },
      include: {
        niveles: {
          include: {
            departamentos: true
          },
          orderBy: {
            numero: 'asc'
          }
        }
      }
    });

    if (!torre) {
      return res.status(404).json({ error: 'Torre no encontrada' });
    }

    const formattedBuilding = {
      id: torre.id_torre,
      name: torre.letra,
      description: torre.descripcion,
      image: torre.imagen,
      floors: torre.niveles.map(nivel => ({
        id: nivel.id_nivel,
        name: nivel.nombre,
        number: nivel.numero,
        apartments: nivel.departamentos.map(dept => dept.nombre)
      })),
      totalApartments: torre.niveles.reduce((total, nivel) => total + nivel.departamentos.length, 0),
      totalResidents: 0 // TODO: Implementar conteo de residentes
    };

    res.json(formattedBuilding);
  } catch (error) {
    console.error('Error al obtener torre:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva torre
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('=== POST /buildings ===');
    const { name, description, floors } = req.body;

    console.log('Datos recibidos:', { name, description, floors });

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Validar campos requeridos
    if (!name || !description) {
      return res.status(400).json({ error: 'Nombre y descripción son requeridos' });
    }

    // Crear la torre con niveles y departamentos
    const nuevaTorre = await prisma.torres.create({
      data: {
        letra: name,
        descripcion: description,
        niveles: {
          create: (floors || []).map(floor => ({
            nombre: floor.name,
            numero: floor.number,
            departamentos: {
              create: (floor.apartments || []).map(aptNumber => ({
                nombre: aptNumber,
                descripcion: `Departamento ${aptNumber}`
              }))
            }
          }))
        }
      },
      include: {
        niveles: {
          include: {
            departamentos: true
          },
          orderBy: {
            numero: 'asc'
          }
        }
      }
    });

    console.log('Torre creada exitosamente:', nuevaTorre.id_torre);

    const formattedBuilding = {
      id: nuevaTorre.id_torre,
      name: nuevaTorre.letra,
      description: nuevaTorre.descripcion,
      floors: nuevaTorre.niveles.map(nivel => ({
        id: nivel.id_nivel,
        name: nivel.nombre,
        number: nivel.numero,
        apartments: nivel.departamentos.map(dept => dept.nombre)
      })),
      totalApartments: nuevaTorre.niveles.reduce((total, nivel) => total + nivel.departamentos.length, 0),
      totalResidents: 0
    };

    res.status(201).json({
      message: 'Torre creada exitosamente',
      building: formattedBuilding
    });

  } catch (error) {
    console.error('Error al crear torre:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar torre
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('=== PUT /buildings/:id ===');
    const { id } = req.params;
    const { name, description, floors } = req.body;

    console.log('ID de torre a actualizar:', id);
    console.log('Datos recibidos:', { name, description, floors });

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Validar campos requeridos
    if (!name || !description) {
      return res.status(400).json({ error: 'Nombre y descripción son requeridos' });
    }

    // Obtener la torre actual
    const existingTorre = await prisma.torres.findUnique({
      where: { id_torre: id },
      include: {
        niveles: {
          include: {
            departamentos: true
          }
        }
      }
    });

    if (!existingTorre) {
      return res.status(404).json({ error: 'Torre no encontrada' });
    }

    console.log('Torre existente encontrada:', existingTorre.letra);

    // Actualizar información básica de la torre
    await prisma.torres.update({
      where: { id_torre: id },
      data: {
        letra: name,
        descripcion: description
      }
    });

    console.log('Información básica de torre actualizada');

    // Procesar los pisos/niveles
    if (floors && Array.isArray(floors)) {
      console.log('Procesando', floors.length, 'pisos');

      // Eliminar niveles y departamentos existentes para recrearlos
      await prisma.departamentos.deleteMany({
        where: {
          id_torre: id
        }
      });

      await prisma.niveles.deleteMany({
        where: {
          id_torre: id
        }
      });

      console.log('Niveles y departamentos existentes eliminados');

      // Crear nuevos niveles y departamentos
      for (const floorData of floors) {
        console.log('Creando nivel:', floorData.name, 'número:', floorData.number);

        const nivel = await prisma.niveles.create({
          data: {
            nombre: floorData.name,
            numero: floorData.number,
            id_torre: id
          }
        });

        console.log('Nivel creado:', nivel.id_nivel);

        // Crear departamentos para este nivel
        if (floorData.apartments && floorData.apartments.length > 0) {
          for (const apartmentNumber of floorData.apartments) {
            await prisma.departamentos.create({
              data: {
                nombre: apartmentNumber,
                descripcion: `Departamento ${apartmentNumber}`,
                id_torre: id,
                id_nivel: nivel.id_nivel
              }
            });
            console.log('Departamento creado:', apartmentNumber);
          }
        }
      }
    }

    // Obtener la torre actualizada con toda la información
    const torreActualizada = await prisma.torres.findUnique({
      where: { id_torre: id },
      include: {
        niveles: {
          include: {
            departamentos: true
          },
          orderBy: {
            numero: 'asc'
          }
        }
      }
    });

    // Formatear respuesta
    const formattedBuilding = {
      id: torreActualizada.id_torre,
      name: torreActualizada.letra,
      description: torreActualizada.descripcion,
      floors: torreActualizada.niveles.map(nivel => ({
        id: nivel.id_nivel,
        name: nivel.nombre,
        number: nivel.numero,
        apartments: nivel.departamentos.map(dept => dept.nombre)
      })),
      totalApartments: torreActualizada.niveles.reduce((total, nivel) => total + nivel.departamentos.length, 0),
      totalResidents: 0
    };

    console.log('Torre actualizada exitosamente');

    res.json({
      message: 'Torre actualizada exitosamente',
      building: formattedBuilding
    });

  } catch (error) {
    console.error('Error al actualizar torre:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Error interno del servidor', 
      details: error.message 
    });
  }
});

// Eliminar torre
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`=== DELETE /buildings/${id} ===`);

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      console.log('❌ Usuario no autorizado');
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    console.log('✅ Usuario autorizado como admin');

    // Verificar si la torre existe
    const torre = await prisma.torres.findUnique({
      where: { id_torre: id },
      include: {
        niveles: {
          include: {
            departamentos: true
          }
        }
      }
    });

    if (!torre) {
      console.log('❌ Torre no encontrada');
      return res.status(404).json({ error: 'Torre no encontrada' });
    }

    console.log(`📊 Torre encontrada: ${torre.letra}`);
    console.log(`📊 Niveles: ${torre.niveles.length}`);
    console.log(`📊 Departamentos totales: ${torre.niveles.reduce((total, nivel) => total + nivel.departamentos.length, 0)}`);

    // Eliminar imágenes físicas de la torre antes de eliminar de la base de datos
    const torreDir = path.join('public', 'torres', id);
    console.log(`🗂️ Verificando carpeta de imágenes: ${torreDir}`);
    
    if (fs.existsSync(torreDir)) {
      console.log(`🗑️ Eliminando carpeta de imágenes: ${torreDir}`);
      try {
        fs.rmSync(torreDir, { recursive: true, force: true });
        console.log(`✅ Carpeta eliminada exitosamente: ${torreDir}`);
      } catch (fileError) {
        console.error('❌ Error al eliminar carpeta de imágenes:', fileError);
      }
    } else {
      console.log(`ℹ️ No se encontró carpeta de imágenes para la torre: ${torreDir}`);
    }

    // Eliminar departamentos primero
    await prisma.departamentos.deleteMany({
      where: { id_torre: id }
    });

    // Eliminar niveles
    await prisma.niveles.deleteMany({
      where: { id_torre: id }
    });

    // Eliminar torre
    await prisma.torres.delete({
      where: { id_torre: id }
    });

    console.log(`✅ Torre ${id} eliminada exitosamente`);
    
    res.json({
      message: 'Torre eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al eliminar torre:', error);
    
    if (error.code === 'P2025') {
      console.error('❌ Registro no encontrado');
      return res.status(404).json({ 
        error: 'Torre no encontrada' 
      });
    }
    
    console.error('❌ Error general:', error.message);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Subir imagen para torre
router.post('/:id/upload-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó imagen' });
    }

    const imagePath = `/edificios/${id}/${req.file.filename}`;
    
    // Actualizar la torre con la nueva imagen
    await prisma.torres.update({
      where: { id_torre: id },
      data: { imagen: imagePath }
    });

    res.json({
      message: 'Imagen subida exitosamente',
      imagePath
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
