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
    console.log('🗂️ Multer destination - req.body:', req.body);
    console.log('🗂️ Multer destination - file:', file);
    
    let uploadPath = path.join('public', 'edificios');

    try {
      // Si es para un piso específico, usar la estructura de carpetas correspondiente
      if (req.body.type === 'floor' && req.body.buildingId && req.body.floorId) {
        uploadPath = path.join('public', 'edificios', req.body.buildingId, 'pisos', req.body.floorId);
      } else if (req.body.buildingId) {
        uploadPath = path.join('public', 'edificios', req.body.buildingId);
      }

      console.log('🗂️ Upload path determinado:', uploadPath);

      // Crear la carpeta si no existe
      if (!fs.existsSync(uploadPath)) {
        console.log('🗂️ Creando directorio:', uploadPath);
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log('✅ Directorio creado exitosamente');
      } else {
        console.log('✅ Directorio ya existe:', uploadPath);
      }

      cb(null, uploadPath);
    } catch (error) {
      console.error('❌ Error en multer destination:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      console.log('📄 Filename generado:', filename);
      cb(null, filename);
    } catch (error) {
      console.error('❌ Error en multer filename:', error);
      cb(error);
    }
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
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    console.log('=== POST /buildings ===');
    console.log('🔐 Usuario autenticado:', req.user);
    console.log('📋 Content-Type:', req.headers['content-type']);
    console.log('📦 Body keys:', Object.keys(req.body));
    console.log('📦 Body:', req.body);
    console.log('🗂️ File:', req.file);
    console.log('📝 Raw headers:', req.headers);
    
    let { name, description, floors } = req.body;

    // Si floors viene como string, parsearlo
    if (typeof floors === 'string') {
      try {
        floors = JSON.parse(floors);
      } catch (parseError) {
        console.error('Error parsing floors:', parseError);
        return res.status(400).json({ error: 'Formato de pisos inválido' });
      }
    }

    console.log('Datos recibidos:', { name, description, floors: floors || 'no floors' });

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
        imagen: req.file ? `/edificios/${req.file.filename}` : null,
        niveles: {
          create: (floors || []).map(floor => ({
            nombre: floor.name,
            numero: floor.number,
            departamentos: {
              create: (floor.apartments || []).map(aptNumber => ({
                nombre: aptNumber,
                no_departamento: aptNumber,
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
      image: nuevaTorre.imagen,
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
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
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
    console.log('Tipo de ID:', typeof id);
    console.log('Usuario:', req.user);

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      console.log('❌ Acceso denegado - rol:', req.user.role);
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Validar campos requeridos
    if (!name || !description) {
      console.log('❌ Campos faltantes - name:', name, 'description:', description);
      return res.status(400).json({ error: 'Nombre y descripción son requeridos' });
    }

    console.log('✅ Validaciones básicas pasadas');

    // Obtener la torre actual
    console.log('🔍 Buscando torre con ID:', id);
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
      console.log('❌ Torre no encontrada con ID:', id);
      return res.status(404).json({ error: 'Torre no encontrada' });
    }

    console.log('✅ Torre existente encontrada:', existingTorre.letra);

    // Actualizar información básica de la torre
    console.log('🔄 Actualizando información básica de la torre...');
    await prisma.torres.update({
      where: { id_torre: id },
      data: {
        letra: name,
        descripcion: description
      }
    });

    console.log('✅ Información básica de torre actualizada');

    // Procesar los pisos/niveles
    if (floors && Array.isArray(floors)) {
      console.log('🏗️ Procesando', floors.length, 'pisos');
      console.log('📋 Floors data:', JSON.stringify(floors, null, 2));

      // Eliminar niveles y departamentos existentes para recrearlos
      console.log('🗑️ Eliminando departamentos existentes...');
      const deletedDepartamentos = await prisma.departamentos.deleteMany({
        where: {
          id_torre: id
        }
      });
      console.log('✅ Departamentos eliminados:', deletedDepartamentos.count);

      console.log('🗑️ Eliminando niveles existentes...');
      const deletedNiveles = await prisma.niveles.deleteMany({
        where: {
          id_torre: id
        }
      });
      console.log('✅ Niveles eliminados:', deletedNiveles.count);

      // Crear nuevos niveles y departamentos
      for (let i = 0; i < floors.length; i++) {
        const floorData = floors[i];
        console.log(`🏗️ Creando nivel ${i + 1}:`, {
          name: floorData.name, 
          number: floorData.number,
          apartmentsCount: floorData.apartments?.length || 0
        });

        const nivel = await prisma.niveles.create({
          data: {
            nombre: floorData.name,
            numero: floorData.number,
            id_torre: id
          }
        });

        console.log('✅ Nivel creado:', nivel.id_nivel);

        // Crear departamentos para este nivel
        if (floorData.apartments && floorData.apartments.length > 0) {
          console.log(`🏠 Creando ${floorData.apartments.length} departamentos para nivel ${floorData.number}`);
          
          for (let j = 0; j < floorData.apartments.length; j++) {
            const apartmentNumber = floorData.apartments[j];
            console.log(`🏠 Creando departamento ${j + 1}: "${apartmentNumber}"`);
            
            await prisma.departamentos.create({
              data: {
                nombre: apartmentNumber,
                no_departamento: apartmentNumber,
                descripcion: `Departamento ${apartmentNumber}`,
                id_torre: id,
                id_nivel: nivel.id_nivel
              }
            });
            console.log(`✅ Departamento creado: ${apartmentNumber}`);
          }
        } else {
          console.log('ℹ️ No hay departamentos para crear en este nivel');
        }
      }
    } else {
      console.log('ℹ️ No se actualizaron los pisos (floors vacío o no es array)');
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

// Subir imagen para piso
router.post('/:id/pisos/:pisoNumber/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    console.log(`=== POST /buildings/${req.params.id}/pisos/${req.params.pisoNumber}/image ===`);
    const { id, pisoNumber } = req.params;
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó imagen' });
    }

    console.log('Archivo recibido:', req.file);

    // Verificar que la torre existe
    const torre = await prisma.torres.findUnique({
      where: { id_torre: id }
    });

    if (!torre) {
      return res.status(404).json({ error: 'Torre no encontrada' });
    }

    // Verificar que el nivel existe
    const nivel = await prisma.niveles.findFirst({
      where: { 
        id_torre: id,
        numero: parseInt(pisoNumber)
      }
    });

    if (!nivel) {
      return res.status(404).json({ error: 'Nivel no encontrado' });
    }

    // Crear directorio para las imágenes de pisos si no existe
    const pisoImagePath = path.join('public', 'edificios', id, 'pisos');
    if (!fs.existsSync(pisoImagePath)) {
      fs.mkdirSync(pisoImagePath, { recursive: true });
    }

    // Mover el archivo a la ubicación correcta
    const filename = `piso-${pisoNumber}-${Date.now()}${path.extname(req.file.originalname)}`;
    const finalPath = path.join(pisoImagePath, filename);
    
    // Mover archivo desde la ubicación temporal
    fs.renameSync(req.file.path, finalPath);

    const imagePath = `/edificios/${id}/pisos/${filename}`;
    
    // Actualizar o crear registro de imagen del piso en la base de datos
    // (si tienes una tabla para imágenes de pisos, actualizarla aquí)
    // Por ahora, solo guardamos la referencia en una estructura que se puede consultar

    console.log('Imagen de piso guardada en:', imagePath);

    res.json({
      message: 'Imagen de piso subida exitosamente',
      imagePath,
      pisoNumber: parseInt(pisoNumber)
    });
  } catch (error) {
    console.error('Error al subir imagen de piso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener imágenes de pisos de una torre
router.get('/:id/pisos/imagenes', authMiddleware, async (req, res) => {
  try {
    console.log(`=== GET /buildings/${req.params.id}/pisos/imagenes ===`);
    const { id } = req.params;

    // Verificar que la torre existe
    const torre = await prisma.torres.findUnique({
      where: { id_torre: id },
      include: {
        niveles: {
          orderBy: { numero: 'asc' }
        }
      }
    });

    if (!torre) {
      return res.status(404).json({ error: 'Torre no encontrada' });
    }

    const floorImages = [];
    const pisoImagePath = path.join('public', 'edificios', id, 'pisos');

    // Verificar si existe el directorio de imágenes de pisos
    if (fs.existsSync(pisoImagePath)) {
      const files = fs.readdirSync(pisoImagePath);
      console.log('Archivos encontrados en pisos:', files);

      // Para cada nivel, buscar su imagen correspondiente
      torre.niveles.forEach(nivel => {
        const pisoFiles = files.filter(file => 
          file.startsWith(`piso-${nivel.numero}-`) && 
          /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        );

        if (pisoFiles.length > 0) {
          // Tomar el archivo más reciente
          const latestFile = pisoFiles.sort((a, b) => {
            const aTime = fs.statSync(path.join(pisoImagePath, a)).mtime;
            const bTime = fs.statSync(path.join(pisoImagePath, b)).mtime;
            return bTime - aTime;
          })[0];

          floorImages.push({
            pisoNumber: nivel.numero,
            pisoName: nivel.nombre,
            imageUrl: `/edificios/${id}/pisos/${latestFile}`
          });
        }
      });
    }

    console.log('Imágenes de pisos encontradas:', floorImages);

    res.json({
      floorImages
    });
  } catch (error) {
    console.error('Error al obtener imágenes de pisos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
