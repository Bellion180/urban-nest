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
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
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

    let parsedFloors = [];
    // Si se proporcionan pisos, parsearlos
    if (floors && typeof floors === 'string') {
      try {
        parsedFloors = JSON.parse(floors);
        console.log('Pisos parseados:', parsedFloors);
      } catch (parseError) {
        console.error('Error parsing floors:', parseError);
      }
    }

    console.log('Pisos a crear:', JSON.stringify(parsedFloors, null, 2));

    // Crear torre con el modelo correcto
    const torre = await prisma.torres.create({
      data: {
        letra: buildingData.name,
        descripcion: buildingData.description,
        // Nota: imagen no está en el modelo Torres actual
      }
    });

    console.log('Torre creada:', torre);

    // Si hay pisos, crearlos en el modelo Niveles
    if (parsedFloors && parsedFloors.length > 0) {
      for (const floorData of parsedFloors) {
        const nivel = await prisma.niveles.create({
          data: {
            nombre: floorData.name,
            numero: floorData.number,
            id_torre: torre.id_torre
          }
        });

        console.log('Nivel creado:', nivel);

        // Si hay apartamentos, crearlos en el modelo Departamentos
        if (floorData.apartments && floorData.apartments.length > 0) {
          for (let i = 0; i < floorData.apartments.length; i++) {
            // El frontend ya genera números correctos (101, 102, 201, 202...)
            // Solo necesitamos usar directamente esos números
            const departmentNumber = floorData.apartments[i];
            
            await prisma.departamentos.create({
              data: {
                nombre: departmentNumber,
                descripcion: `Departamento ${departmentNumber}`,
                id_torre: torre.id_torre,
                id_nivel: nivel.id_nivel
              }
            });
            console.log('Departamento creado:', departmentNumber);
          }
        }
      }
    }

    console.log('Torre creada exitosamente:', torre.id_torre);

    // Mover imagen a carpeta definitiva del edificio
    if (req.file) {
      const oldPath = path.join('public', 'edificios', 'temp', req.file.filename);
      const newDir = path.join('public', 'edificios', torre.id_torre.toString());
      if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });
      const newPath = path.join(newDir, req.file.filename);
      fs.renameSync(oldPath, newPath);
      
      imagePath = `/edificios/${torre.id_torre}/${req.file.filename}`;
      console.log('Imagen movida a:', imagePath);
    }

    // Obtener la torre creada con sus relaciones para formatear la respuesta
    const torreCompleta = await prisma.torres.findUnique({
      where: { id_torre: torre.id_torre },
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

    // Formatear respuesta similar a la estructura esperada por el frontend
    const formattedBuilding = {
      id: torreCompleta.id_torre,
      name: torreCompleta.letra,
      description: torreCompleta.descripcion,
      image: imagePath,
      floors: torreCompleta.niveles.map(nivel => ({
        id: nivel.id_nivel,
        name: nivel.nombre,
        number: nivel.numero,
        apartments: nivel.departamentos.map(dept => dept.nombre)
      })),
      totalApartments: torreCompleta.niveles.reduce((total, nivel) => total + nivel.departamentos.length, 0),
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

    // Obtener la torre actual con sus niveles y departamentos
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

// Eliminar edificio
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

    if (!building) {
      console.log('❌ Edificio no encontrado');
      return res.status(404).json({ error: 'Edificio no encontrado' });
    }

    console.log(`📊 Edificio encontrado: ${building.name}`);
    console.log(`📊 Pisos: ${building.floors.length}`);
    console.log(`📊 Apartamentos totales: ${building.floors.reduce((total, floor) => total + floor.apartments.length, 0)}`);

    // Verificar si hay residentes en el edificio y desasignarlos
    const residentsInBuilding = await prisma.resident.findMany({
      where: { buildingId: id },
      select: { id: true, nombre: true, apellido: true }
    });

    console.log(`👥 Residentes encontrados en el edificio: ${residentsInBuilding.length}`);

    let desassignedResidents = [];
    
    if (residentsInBuilding.length > 0) {
      console.log(`🔄 Desasignando ${residentsInBuilding.length} residentes...`);
      
      // Desasignar residentes del edificio (poner campos como null)
      const updateResult = await prisma.resident.updateMany({
        where: { buildingId: id },
        data: {
          buildingId: null,
          apartmentId: null
        }
      });
      
      desassignedResidents = residentsInBuilding.map(r => `${r.nombre} ${r.apellido}`);
      console.log(`✅ ${updateResult.count} residentes desasignados del edificio`);
    } else {
      console.log('ℹ️ No hay residentes para desasignar');
    }

    // Eliminar imágenes físicas del edificio antes de eliminar de la base de datos
    const buildingDir = path.join('public', 'edificios', id);
    console.log(`🗂️ Verificando carpeta de imágenes: ${buildingDir}`);
    
    if (fs.existsSync(buildingDir)) {
      console.log(`🗑️ Eliminando carpeta de imágenes: ${buildingDir}`);
      try {
        // Eliminar toda la carpeta del edificio recursivamente
        fs.rmSync(buildingDir, { recursive: true, force: true });
        console.log(`✅ Carpeta eliminada exitosamente: ${buildingDir}`);
      } catch (fileError) {
        console.error('❌ Error al eliminar carpeta de imágenes:', fileError);
        // Continúa con la eliminación de la base de datos aunque falle la eliminación de archivos
      }
    } else {
      console.log(`ℹ️ No se encontró carpeta de imágenes para el edificio: ${buildingDir}`);
    }

    // Eliminar edificio de la base de datos (Prisma eliminará automáticamente pisos y apartamentos por la cascada)
    console.log(`🗑️ Eliminando edificio de la base de datos...`);
    await prisma.building.delete({
      where: { id }
    });

    console.log(`✅ Edificio ${id} eliminado exitosamente`);
    
    const responseMessage = desassignedResidents.length > 0 
      ? `Edificio eliminado exitosamente. ${desassignedResidents.length} residentes fueron desasignados: ${desassignedResidents.join(', ')}`
      : 'Edificio eliminado exitosamente';
    
    res.json({
      message: responseMessage,
      desassignedResidents: desassignedResidents
    });
  } catch (error) {
    console.error('❌ Error al eliminar edificio:', error);
    
    // Analizar el tipo de error
    if (error.code === 'P2003') {
      console.error('❌ Error de restricción de clave foránea');
      return res.status(400).json({ 
        error: 'No se puede eliminar el edificio debido a restricciones de base de datos',
        details: 'Existen relaciones que impiden la eliminación'
      });
    }
    
    if (error.code === 'P2025') {
      console.error('❌ Registro no encontrado');
      return res.status(404).json({ 
        error: 'Edificio no encontrado' 
      });
    }
    
    console.error('❌ Error general:', error.message);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

export default router;
