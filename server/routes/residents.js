import express from 'express';
import { prisma } from '../../src/lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

console.log('🏠 Cargando rutas de residents...');

// Configuración de multer para fotos de perfil y documentos PDF
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Obtener datos del body para construir la ruta
    let { buildingId, apartmentNumber, floorNumber } = req.body;
    
    // Para casos de edición, la información se obtendrá en el endpoint
    // Por ahora, usar un directorio temporal
    if (!buildingId || !apartmentNumber || !floorNumber) {
      const tempDir = path.join('public', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      return cb(null, tempDir);
    }
    
    const dir = path.join('public', 'edificios', buildingId, 'pisos', floorNumber.toString(), 'apartamentos', apartmentNumber);
    
    // Crear directorio si no existe
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Determinar el nombre del archivo basado en el fieldname
    if (file.fieldname === 'profilePhoto') {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `perfil${ext}`);
    } else if (file.fieldname.startsWith('documents_')) {
      // Extraer el tipo de documento del fieldname (documents_curp, documents_ine, etc.)
      const docType = file.fieldname.replace('documents_', '');
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `documento_${docType}${ext}`);
    } else {
      cb(new Error('Tipo de archivo no reconocido'));
    }
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profilePhoto') {
      // Para fotos de perfil, solo imágenes
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen para la foto de perfil'));
      }
    } else if (file.fieldname.startsWith('documents_')) {
      // Para documentos, solo PDFs
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos PDF para los documentos'));
      }
    } else {
      cb(new Error('Tipo de archivo no reconocido'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB límite máximo
    fieldSize: 2 * 1024 * 1024 // 2MB para campos de texto
  }
});

// Obtener todos los residentes
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 API: Endpoint /residents called');
    const { building, status, search } = req.query;

    const where = {};

    if (building) {
      where.buildingId = building;
    }

    if (status) {
      where.estatus = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const residents = await prisma.resident.findMany({
      where,
      include: {
        building: {
          select: {
            name: true
          }
        },
        apartment: {
          include: {
            floor: {
              select: {
                name: true,
                number: true
              }
            }
          }
        },
        payments: {
          orderBy: {
            date: 'desc'
          },
          take: 5
        },
        inviInfo: true
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });

    console.log('🔍 Residents found:', residents.length);
    residents.forEach((resident, index) => {
      console.log(`   ${index + 1}. ${resident.nombre} ${resident.apellido} - INVI: ${resident.inviInfo ? 'YES' : 'NO'}`);
      if (resident.inviInfo) {
        console.log(`      INVI ID: ${resident.inviInfo.idInvi}`);
      }
    });

    const formattedResidents = residents.map(resident => {
      console.log(`🔧 Mapping resident: ${resident.nombre} - Building: ${resident.building?.name || 'SIN EDIFICIO'} - Apartment: ${resident.apartment?.number || 'SIN APARTAMENTO'}`);
      return {
      id: resident.id,
      nombre: resident.nombre,
      apellido: resident.apellido,
      edad: resident.edad,
      email: resident.email,
      telefono: resident.telefono,
      fechaNacimiento: resident.fechaNacimiento,
      noPersonas: resident.noPersonas,
      discapacidad: resident.discapacidad,
      noPersonasDiscapacitadas: resident.noPersonasDiscapacitadas,
      profilePhoto: resident.profilePhoto,
      // Campos de documentos
      documentoCurp: resident.documentoCurp,
      documentoComprobanteDomicilio: resident.documentoComprobanteDomicilio,
      documentoActaNacimiento: resident.documentoActaNacimiento,
      documentoIne: resident.documentoIne,
      estatus: resident.estatus,
      hasKey: resident.hasKey,
      registrationDate: resident.registrationDate,
      deudaActual: resident.deudaActual,
      pagosRealizados: resident.pagosRealizados,
      informe: resident.informe,
      edificio: resident.building?.name || null,
      apartamento: resident.apartment?.number || null,
      piso: resident.apartment?.floor?.name || null,
      recentPayments: resident.payments,
      inviInfo: resident.inviInfo
    };
    });

    res.json(formattedResidents);
  } catch (error) {
    console.error('Error al obtener residentes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Test endpoint simple
router.get('/test-route', authMiddleware, async (req, res) => {
  console.log('📍 Test route alcanzada');
  res.json({ message: 'Test route works!' });
});

// Obtener residentes por edificio y piso
router.get('/by-floor/:buildingId/:floorNumber', authMiddleware, async (req, res) => {
  console.log('📍 By-floor route alcanzada');
  try {
    const { buildingId, floorNumber } = req.params;
    console.log(`Obteniendo residentes del edificio ${buildingId}, piso ${floorNumber}`);

    const residents = await prisma.resident.findMany({
      where: {
        buildingId: buildingId,
        apartment: {
          floor: {
            number: parseInt(floorNumber)
          }
        }
      },
      include: {
        building: {
          select: {
            name: true
          }
        },
        apartment: {
          include: {
            floor: {
              select: {
                name: true,
                number: true
              }
            }
          }
        },
        payments: {
          orderBy: {
            date: 'desc'
          },
          take: 5
        },
        inviInfo: true
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });

    console.log(`Encontrados ${residents.length} residentes en el piso ${floorNumber}`);

    const formattedResidents = residents.map(resident => {
      console.log(`🔍 DEBUG - Residente ${resident.nombre} campos de documentos:`);
      console.log(`  - documentoCurp: ${resident.documentoCurp}`);
      console.log(`  - documentoComprobanteDomicilio: ${resident.documentoComprobanteDomicilio}`);
      console.log(`  - documentoActaNacimiento: ${resident.documentoActaNacimiento}`);
      console.log(`  - documentoIne: ${resident.documentoIne}`);
      
      return {
        id: resident.id,
      nombre: resident.nombre,
      apellido: resident.apellido,
      edad: resident.edad,
      email: resident.email,
      telefono: resident.telefono,
      fechaNacimiento: resident.fechaNacimiento,
      noPersonas: resident.noPersonas,
      discapacidad: resident.discapacidad,
      noPersonasDiscapacitadas: resident.noPersonasDiscapacitadas,
      profilePhoto: resident.profilePhoto,
      // Campos de documentos
      documentoCurp: resident.documentoCurp,
      documentoComprobanteDomicilio: resident.documentoComprobanteDomicilio,
      documentoActaNacimiento: resident.documentoActaNacimiento,
      documentoIne: resident.documentoIne,
      estatus: resident.estatus,
      hasKey: resident.hasKey,
      registrationDate: resident.registrationDate,
      deudaActual: resident.deudaActual,
      pagosRealizados: resident.pagosRealizados,
      informe: resident.informe,
      edificio: resident.building.name,
      apartamento: resident.apartment.number,
      piso: resident.apartment.floor.name,
      pisoNumero: resident.apartment.floor.number,
      recentPayments: resident.payments,
      inviInfo: resident.inviInfo
    }; // Cerrando el objeto return
    }); // Cerrando el map

    console.log(`Encontrados ${formattedResidents.length} residentes en el piso ${floorNumber}`);
    
    // Debug: Imprimir campos de documentos del primer residente
    if (formattedResidents.length > 0) {
      const firstResident = formattedResidents[0];
      console.log('🔍 Debug - Campos de documentos del primer residente:');
      console.log('documentoCurp:', firstResident.documentoCurp);
      console.log('documentoComprobanteDomicilio:', firstResident.documentoComprobanteDomicilio);
      console.log('documentoActaNacimiento:', firstResident.documentoActaNacimiento);
      console.log('documentoIne:', firstResident.documentoIne);
    }
    
    res.json(formattedResidents);
  } catch (error) {
    console.error('Error al obtener residentes por piso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo residente
router.post('/', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'documents_curp', maxCount: 1 },
  { name: 'documents_comprobanteDomicilio', maxCount: 1 },
  { name: 'documents_actaNacimiento', maxCount: 1 },
  { name: 'documents_ine', maxCount: 1 }
]), authMiddleware, async (req, res) => {
  try {
    console.log('=== POST /residents ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('User:', req.user);

    const {
      nombre,
      apellido,
      edad,
      email,
      telefono,
      fechaNacimiento,
      noPersonas,
      discapacidad,
      noPersonasDiscapacitadas,
      deudaActual,
      pagosRealizados,
      buildingId,
      apartmentNumber,
      floorNumber,
      inviInfo
    } = req.body;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Buscar el apartamento
    const apartment = await prisma.apartment.findFirst({
      where: {
        number: apartmentNumber,
        floor: {
          buildingId: buildingId,
          number: parseInt(floorNumber)
        }
      },
      include: {
        floor: true
      }
    });

    if (!apartment) {
      return res.status(404).json({ error: 'Apartamento no encontrado' });
    }

    // Verificar si ya hay residentes en ese apartamento
    const existingResident = await prisma.resident.findFirst({
      where: {
        apartmentId: apartment.id,
        estatus: 'ACTIVO'
      }
    });

    if (existingResident) {
      return res.status(400).json({ 
        error: 'Ya existe un residente activo en ese apartamento' 
      });
    }

    // Procesar la foto de perfil si se subió
    let profilePhotoPath = null;
    if (req.files && req.files.profilePhoto && req.files.profilePhoto[0]) {
      const profilePhoto = req.files.profilePhoto[0];
      profilePhotoPath = `/edificios/${buildingId}/pisos/${floorNumber}/apartamentos/${apartmentNumber}/${profilePhoto.filename}`;
      console.log('Foto de perfil guardada en:', profilePhotoPath);
    }

    // Procesar documentos PDF si se subieron
    let documentPaths = {};
    if (req.files) {
      const documentTypes = ['curp', 'comprobanteDomicilio', 'actaNacimiento', 'ine'];
      
      documentTypes.forEach(docType => {
        const fieldName = `documents_${docType}`;
        if (req.files[fieldName] && req.files[fieldName][0]) {
          const document = req.files[fieldName][0];
          documentPaths[docType] = `/edificios/${buildingId}/pisos/${floorNumber}/apartamentos/${apartmentNumber}/${document.filename}`;
          console.log(`Documento ${docType} guardado en:`, documentPaths[docType]);
        }
      });
    }

    console.log('User:', req.user);

    // Verificar si req.user.id existe
    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: 'Usuario no válido' });
    }

    // Parsear información INVI si existe
    let parsedInviInfo = null;
    if (inviInfo) {
      try {
        parsedInviInfo = typeof inviInfo === 'string' ? JSON.parse(inviInfo) : inviInfo;
      } catch (error) {
        console.error('Error parsing inviInfo:', error);
      }
    }

    const resident = await prisma.resident.create({
      data: {
        nombre,
        apellido,
        edad: edad ? parseInt(edad) : null,
        email,
        telefono,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        noPersonas: noPersonas ? parseInt(noPersonas) : null,
        discapacidad: discapacidad === 'true' || discapacidad === true,
        noPersonasDiscapacitadas: (discapacidad === 'true' || discapacidad === true) 
          ? (noPersonasDiscapacitadas ? parseInt(noPersonasDiscapacitadas) : 0) 
          : 0,
        deudaActual: deudaActual ? parseFloat(deudaActual) : 0,
        pagosRealizados: pagosRealizados ? parseFloat(pagosRealizados) : 0,
        profilePhoto: profilePhotoPath,
        // Agregar rutas de documentos
        documentoCurp: documentPaths.curp || null,
        documentoComprobanteDomicilio: documentPaths.comprobanteDomicilio || null,
        documentoActaNacimiento: documentPaths.actaNacimiento || null,
        documentoIne: documentPaths.ine || null,
        buildingId,
        apartmentId: apartment.id,
        estatus: 'ACTIVO',
        createdById: req.user.id,
        // Crear información INVI si se proporciona
        ...(parsedInviInfo && {
          inviInfo: {
            create: {
              idInvi: parsedInviInfo.idInvi || null,
              mensualidades: parsedInviInfo.mensualidades ? parseInt(parsedInviInfo.mensualidades) : null,
              fechaContrato: parsedInviInfo.fechaContrato ? new Date(parsedInviInfo.fechaContrato) : null,
              deuda: parsedInviInfo.deuda ? parseFloat(parsedInviInfo.deuda) : 0,
              idCompanero: parsedInviInfo.idCompanero || null
            }
          }
        })
      },
      include: {
        building: true,
        apartment: {
          include: {
            floor: true
          }
        },
        inviInfo: true
      }
    });

    res.status(201).json({
      message: 'Residente creado exitosamente',
      resident
    });
  } catch (error) {
    console.error('Error al crear residente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener residentes sin edificio asignado
router.get('/unassigned', authMiddleware, async (req, res) => {
  try {
    console.log('🏠 API: Obteniendo residentes sin edificio asignado');

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const unassignedResidents = await prisma.resident.findMany({
      where: {
        buildingId: null
      },
      include: {
        inviInfo: true
      }
    });

    console.log(`🔍 Encontrados ${unassignedResidents.length} residentes sin edificio asignado`);
    
    // Mostrar detalles de cada residente
    unassignedResidents.forEach((resident, index) => {
      console.log(`   ${index + 1}. ${resident.nombre} ${resident.apellido} - Building ID: ${resident.buildingId}`);
    });

    const formattedResidents = unassignedResidents.map(resident => ({
      id: resident.id,
      nombre: resident.nombre,
      apellido: resident.apellido,
      edad: resident.edad,
      email: resident.email,
      telefono: resident.telefono,
      fechaNacimiento: resident.fechaNacimiento,
      noPersonas: resident.noPersonas,
      discapacidad: resident.discapacidad,
      noPersonasDiscapacitadas: resident.noPersonasDiscapacitadas,
      profilePhoto: resident.profilePhoto,
      estatus: resident.estatus,
      hasKey: resident.hasKey,
      registrationDate: resident.registrationDate,
      deudaActual: resident.deudaActual,
      pagosRealizados: resident.pagosRealizados,
      informe: resident.informe,
      edificio: null,
      apartamento: null,
      piso: null,
      pisoNumero: null,
      buildingId: null,
      apartmentId: null,
      inviInfo: resident.inviInfo
    }));

    console.log(`📤 Enviando ${formattedResidents.length} residentes sin edificio al frontend`);
    res.json(formattedResidents);
  } catch (error) {
    console.error('Error al obtener residentes sin edificio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Test GET para un residente específico
router.get('/:id', authMiddleware, async (req, res) => {
  console.log('🔍 GET Endpoint para residente:', req.params.id);
  try {
    const resident = await prisma.resident.findUnique({
      where: { id: req.params.id },
      include: {
        building: true,
        apartment: {
          include: {
            floor: true
          }
        }
      }
    });

    if (!resident) {
      return res.status(404).json({ error: 'Residente no encontrado' });
    }

    res.json({ resident });
  } catch (error) {
    console.error('Error al obtener residente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Test MUY simple CON middleware
router.put('/test-simple', authMiddleware, async (req, res) => {
  console.log('🧪 Test simple funcionando');
  res.json({ message: 'Test simple funcionando' });
});

// Test simple de endpoint documents
router.put('/documents/:id', authMiddleware, async (req, res) => {
  console.log('🗂️  SIMPLE Endpoint documents llamado para residente:', req.params.id);
  res.json({ message: 'Endpoint documents funcionando', id: req.params.id });
});
console.log('✅ Ruta /documents/:id registrada');

// Test simple de endpoint with-documents
router.put('/:id/with-documents', authMiddleware, async (req, res) => {
  console.log('🗂️  SIMPLE Endpoint with-documents llamado para residente:', req.params.id);
  res.json({ message: 'Endpoint with-documents funcionando', id: req.params.id });
});
console.log('✅ Ruta /:id/with-documents registrada');

// Actualizar residente con documentos (COMPLEJO - DESHABILITADO TEMPORALMENTE)
/*
router.put('/:id/with-documents', authMiddleware, upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'documents_curp', maxCount: 1 },
  { name: 'documents_comprobanteDomicilio', maxCount: 1 },
  { name: 'documents_actaNacimiento', maxCount: 1 },
  { name: 'documents_ine', maxCount: 1 }
]), async (req, res) => {
  console.log('🗂️  Endpoint with-documents llamado para residente:', req.params.id);
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener el residente actual para conocer sus documentos actuales
    const currentResident = await prisma.resident.findUnique({
      where: { id }
    });

    if (!currentResident) {
      return res.status(404).json({ error: 'Residente no encontrado' });
    }

    // Procesar campos numéricos
    if (updateData.edad) updateData.edad = parseInt(updateData.edad);
    if (updateData.noPersonas) updateData.noPersonas = parseInt(updateData.noPersonas);
    if (updateData.noPersonasDiscapacitadas) updateData.noPersonasDiscapacitadas = parseInt(updateData.noPersonasDiscapacitadas);
    if (updateData.deudaActual) updateData.deudaActual = parseFloat(updateData.deudaActual);
    if (updateData.pagosRealizados) updateData.pagosRealizados = parseFloat(updateData.pagosRealizados);
    if (updateData.fechaNacimiento) updateData.fechaNacimiento = new Date(updateData.fechaNacimiento);

    // Manejar eliminación de documentos
    const documentsToRemove = [];
    if (updateData.removeDocuments) {
      try {
        documentsToRemove.push(...JSON.parse(updateData.removeDocuments));
      } catch (e) {
        console.error('Error parsing removeDocuments:', e);
      }
    }

    // Eliminar documentos solicitados
    for (const docType of documentsToRemove) {
      const fieldMap = {
        'curp': 'documentoCurp',
        'comprobanteDomicilio': 'documentoComprobanteDomicilio',
        'actaNacimiento': 'documentoActaNacimiento',
        'ine': 'documentoIne'
      };

      const dbField = fieldMap[docType];
      if (dbField && currentResident[dbField]) {
        // Eliminar archivo físico
        const fullPath = path.join(process.cwd(), 'public', currentResident[dbField]);
        try {
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`Documento eliminado: ${fullPath}`);
          }
        } catch (err) {
          console.error(`Error eliminando archivo ${fullPath}:`, err);
        }
        
        // Limpiar campo en base de datos
        updateData[dbField] = null;
      }
    }

    // Manejar archivos subidos
    if (req.files) {
      const { buildingId, apartmentNumber, floorNumber } = updateData;
      
      // Si no tenemos los datos de ubicación, usar los del residente actual
      const building = buildingId || currentResident.buildingId;
      const apartment = apartmentNumber || currentResident.apartmentNumber;
      const floor = floorNumber || currentResident.floorNumber;

      // Procesar documentos
      const docTypes = ['curp', 'comprobanteDomicilio', 'actaNacimiento', 'ine'];
      const docFieldMap = {
        'curp': 'documentoCurp',
        'comprobanteDomicilio': 'documentoComprobanteDomicilio',
        'actaNacimiento': 'documentoActaNacimiento',
        'ine': 'documentoIne'
      };

      for (const docType of docTypes) {
        const fieldName = `documents_${docType}`;
        if (req.files[fieldName]) {
          const file = req.files[fieldName][0];
          const relativePath = `/edificios/${building}/pisos/${floor}/apartamentos/${apartment}/${file.filename}`;
          updateData[docFieldMap[docType]] = relativePath;
        }
      }

      // Procesar foto de perfil
      if (req.files.profilePhoto) {
        const file = req.files.profilePhoto[0];
        const relativePath = `/edificios/${building}/pisos/${floor}/apartamentos/${apartment}/${file.filename}`;
        updateData.profilePhoto = relativePath;
      }
    }

    // Limpiar campos que no deben ir a la base de datos
    delete updateData.removeDocuments;

    const resident = await prisma.resident.update({
      where: { id },
      data: updateData,
      include: {
        building: true,
        apartment: {
          include: {
            floor: true
          }
        }
      }
    });

    res.json({
      message: 'Residente actualizado exitosamente',
      resident
    });
  } catch (error) {
    console.error('Error al actualizar residente con documentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
*/

// Actualizar residente (solo datos, sin archivos)
router.put('/:id', authMiddleware, async (req, res) => {
  console.log('�🚨🚨 ENDPOINT PUT /:id LLAMADO 🚨🚨🚨');
  console.log('�📝 Endpoint general PUT llamado para residente:', req.params.id);
  console.log('📋 Body recibido:', req.body);
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    console.log('🔍 UpdateData procesado:', updateData);

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    console.log('✅ Usuario autorizado como admin');

    // Obtener el residente actual para conocer sus documentos actuales
    const currentResident = await prisma.resident.findUnique({
      where: { id },
      include: {
        building: true,
        apartment: {
          include: {
            floor: true
          }
        }
      }
    });

    if (!currentResident) {
      return res.status(404).json({ error: 'Residente no encontrado' });
    }

    console.log('✅ Residente encontrado en BD con relaciones');
    console.log('🏢 Building:', currentResident.building?.id);
    console.log('🏠 Apartment:', currentResident.apartment?.number);
    console.log('📊 Floor:', currentResident.apartment?.floor?.number);

    // Manejar eliminación de documentos si se especifica
    const documentsToRemove = [];
    if (updateData.removeDocuments) {
      try {
        // Si removeDocuments ya es un array (JSON), úsalo directamente
        if (Array.isArray(updateData.removeDocuments)) {
          documentsToRemove.push(...updateData.removeDocuments);
        } else {
          // Si es string (FormData), parsearlo como JSON
          documentsToRemove.push(...JSON.parse(updateData.removeDocuments));
        }
        console.log('🗑️ Documentos a eliminar:', documentsToRemove);
      } catch (e) {
        console.error('Error parsing removeDocuments:', e);
      }
    }

    console.log('🔄 Procesando eliminación de documentos...');

    // Eliminar documentos solicitados
    for (const docType of documentsToRemove) {
      console.log(`🗑️ Procesando documento: ${docType}`);
      const fieldMap = {
        'curp': 'documentoCurp',
        'comprobanteDomicilio': 'documentoComprobanteDomicilio',
        'actaNacimiento': 'documentoActaNacimiento',
        'ine': 'documentoIne'
      };

      const dbField = fieldMap[docType];
      console.log(`📋 Campo BD: ${dbField}`);
      
      if (dbField && currentResident[dbField]) {
        console.log(`📄 Archivo actual: ${currentResident[dbField]}`);
        // Eliminar archivo físico
        const fullPath = path.join(process.cwd(), 'public', currentResident[dbField]);
        console.log(`🗂️ Ruta completa: ${fullPath}`);
        
        try {
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`📄 Documento eliminado: ${fullPath}`);
          } else {
            console.log(`⚠️ Archivo no existe: ${fullPath}`);
          }
        } catch (err) {
          console.error(`❌ Error eliminando archivo ${fullPath}:`, err);
        }
        
        // Limpiar campo en base de datos
        updateData[dbField] = null;
        console.log(`🗃️ Campo ${dbField} marcado como null en BD`);
      }
    }

    console.log('� Procesando nuevos documentos subidos...');

    // Procesar nuevos archivos de documentos si se enviaron
    if (req.files) {
      console.log('📁 Archivos recibidos:', Object.keys(req.files));
      
      const fileFieldMap = {
        'documents_curp': 'documentoCurp',
        'documents_comprobanteDomicilio': 'documentoComprobanteDomicilio',
        'documents_actaNacimiento': 'documentoActaNacimiento',
        'documents_ine': 'documentoIne'
      };

      // Obtener información del residente para crear la ruta correcta
      const buildingId = currentResident.building.id;
      const apartmentNumber = currentResident.apartment.number.toString();
      const floorNumber = currentResident.apartment.floor.number.toString();
      
      const finalDir = path.join('public', 'edificios', buildingId, 'pisos', floorNumber, 'apartamentos', apartmentNumber);
      
      // Crear directorio final si no existe
      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
        console.log(`📂 Directorio creado: ${finalDir}`);
      }

      Object.entries(req.files).forEach(([fieldName, fileArray]) => {
        if (fileFieldMap[fieldName] && fileArray && fileArray.length > 0) {
          const file = fileArray[0];
          
          // Crear nombre del archivo final
          const docType = fieldName.replace('documents_', '');
          const ext = path.extname(file.originalname).toLowerCase();
          const finalFileName = `documento_${docType}${ext}`;
          const finalFilePath = path.join(finalDir, finalFileName);
          
          try {
            // Mover archivo de temp al directorio final
            fs.renameSync(file.path, finalFilePath);
            
            // Crear ruta relativa para la base de datos
            const relativePath = `/edificios/${buildingId}/pisos/${floorNumber}/apartamentos/${apartmentNumber}/${finalFileName}`;
            updateData[fileFieldMap[fieldName]] = relativePath;
            
            console.log(`📄 Archivo movido: ${file.path} -> ${finalFilePath}`);
            console.log(`📄 Ruta en BD: ${relativePath}`);
          } catch (error) {
            console.error(`❌ Error moviendo archivo ${fieldName}:`, error);
          }
        }
      });
    }

    console.log('🔄 Procesando campos numéricos...');

    // Procesar campos numéricos
    if (updateData.edad) updateData.edad = parseInt(updateData.edad);
    if (updateData.noPersonas) updateData.noPersonas = parseInt(updateData.noPersonas);
    if (updateData.noPersonasDiscapacitadas) updateData.noPersonasDiscapacitadas = parseInt(updateData.noPersonasDiscapacitadas);
    if (updateData.deudaActual) updateData.deudaActual = parseFloat(updateData.deudaActual);
    if (updateData.pagosRealizados) updateData.pagosRealizados = parseFloat(updateData.pagosRealizados);
    if (updateData.fechaNacimiento) updateData.fechaNacimiento = new Date(updateData.fechaNacimiento);

    // Si no hay discapacidad, establecer personas discapacitadas a 0
    if (updateData.discapacidad === false) {
      updateData.noPersonasDiscapacitadas = 0;
      console.log('🚫 Discapacidad = false, estableciendo noPersonasDiscapacitadas = 0');
    }

    console.log('📋 Procesando información INVI (CÓDIGO ACTUALIZADO)...');
    
    // Preparar datos para actualización de información INVI
    let inviData = null;
    if (updateData.inviInfo) {
      console.log('📊 Datos INVI recibidos:', updateData.inviInfo);
      
      inviData = {
        idInvi: updateData.inviInfo.idInvi || null,
        mensualidades: updateData.inviInfo.mensualidades ? parseInt(updateData.inviInfo.mensualidades) : null,
        deuda: updateData.inviInfo.deuda ? parseFloat(updateData.inviInfo.deuda) : 0,
        fechaContrato: updateData.inviInfo.fechaContrato ? new Date(updateData.inviInfo.fechaContrato) : null,
        idCompanero: updateData.inviInfo.idCompanero || null
      };
      
      console.log('✅ Datos INVI procesados para BD:', inviData);
      
      // Remover el objeto inviInfo del updateData principal
      delete updateData.inviInfo;
    }

    // Limpiar campos que no deben ir a la base de datos
    delete updateData.removeDocuments;

    console.log('🔄 Actualizando residente en BD...');

    const resident = await prisma.resident.update({
      where: { id },
      data: {
        ...updateData,
        // Actualizar o crear información INVI si se proporcionó
        ...(inviData && {
          inviInfo: {
            upsert: {
              create: inviData,
              update: inviData
            }
          }
        })
      },
      include: {
        building: true,
        apartment: {
          include: {
            floor: true
          }
        },
        inviInfo: true
      }
    });

    res.json({
      message: 'Residente actualizado exitosamente',
      resident
    });
  } catch (error) {
    console.error('Error al actualizar residente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar residente con documentos
router.put('/:id/documents', authMiddleware, upload.fields([
  { name: 'documents_curp', maxCount: 1 },
  { name: 'documents_comprobanteDomicilio', maxCount: 1 },
  { name: 'documents_actaNacimiento', maxCount: 1 },
  { name: 'documents_ine', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 }
]), async (req, res) => {
  console.log('📁🚨 ENDPOINT PUT /:id/documents LLAMADO 🚨📁');
  console.log('📋 Body recibido:', req.body);
  console.log('📁 Files recibidos:', req.files ? Object.keys(req.files) : 'ninguno');
  
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener el residente actual con relaciones
    const currentResident = await prisma.resident.findUnique({
      where: { id },
      include: {
        building: true,
        apartment: {
          include: {
            floor: true
          }
        }
      }
    });

    if (!currentResident) {
      return res.status(404).json({ error: 'Residente no encontrado' });
    }

    console.log('✅ Residente encontrado para subida de documentos');

    // Procesar archivos de documentos si se enviaron
    if (req.files) {
      const fileFieldMap = {
        'documents_curp': 'documentoCurp',
        'documents_comprobanteDomicilio': 'documentoComprobanteDomicilio',
        'documents_actaNacimiento': 'documentoActaNacimiento',
        'documents_ine': 'documentoIne'
      };

      // Obtener información del residente para crear la ruta correcta
      const buildingId = currentResident.building.id;
      const apartmentNumber = currentResident.apartment.number.toString();
      const floorNumber = currentResident.apartment.floor.number.toString();
      
      const finalDir = path.join('public', 'edificios', buildingId, 'pisos', floorNumber, 'apartamentos', apartmentNumber);
      
      // Crear directorio final si no existe
      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
        console.log(`📂 Directorio creado: ${finalDir}`);
      }

      Object.entries(req.files).forEach(([fieldName, fileArray]) => {
        if (fileFieldMap[fieldName] && fileArray && fileArray.length > 0) {
          const file = fileArray[0];
          
          // Crear nombre del archivo final
          const docType = fieldName.replace('documents_', '');
          const ext = path.extname(file.originalname).toLowerCase();
          const finalFileName = `documento_${docType}${ext}`;
          const finalFilePath = path.join(finalDir, finalFileName);
          
          try {
            // Mover archivo de temp al directorio final
            fs.renameSync(file.path, finalFilePath);
            
            // Crear ruta relativa para la base de datos
            const relativePath = `/edificios/${buildingId}/pisos/${floorNumber}/apartamentos/${apartmentNumber}/${finalFileName}`;
            updateData[fileFieldMap[fieldName]] = relativePath;
            
            console.log(`📄 Archivo movido: ${file.path} -> ${finalFilePath}`);
            console.log(`📄 Ruta en BD: ${relativePath}`);
          } catch (error) {
            console.error(`❌ Error moviendo archivo ${fieldName}:`, error);
          }
        }
      });
    }

    // Manejar eliminación de documentos si se especifica
    const documentsToRemove = [];
    if (updateData.removeDocuments) {
      try {
        if (Array.isArray(updateData.removeDocuments)) {
          documentsToRemove.push(...updateData.removeDocuments);
        } else {
          documentsToRemove.push(...JSON.parse(updateData.removeDocuments));
        }
        console.log('🗑️ Documentos a eliminar:', documentsToRemove);
      } catch (e) {
        console.error('Error parsing removeDocuments:', e);
      }
    }

    // Eliminar documentos solicitados
    for (const docType of documentsToRemove) {
      console.log(`🗑️ Procesando documento: ${docType}`);
      const fieldMap = {
        'curp': 'documentoCurp',
        'comprobanteDomicilio': 'documentoComprobanteDomicilio',
        'actaNacimiento': 'documentoActaNacimiento',
        'ine': 'documentoIne'
      };

      const dbField = fieldMap[docType];
      
      if (dbField && currentResident[dbField]) {
        // Eliminar archivo físico
        const fullPath = path.join(process.cwd(), 'public', currentResident[dbField]);
        
        try {
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`📄 Documento eliminado: ${fullPath}`);
          }
        } catch (err) {
          console.error(`❌ Error eliminando archivo ${fullPath}:`, err);
        }
        
        // Limpiar campo en base de datos
        updateData[dbField] = null;
      }
    }

    // Limpiar campos que no deben ir a la base de datos
    delete updateData.removeDocuments;

    console.log('🔄 Procesando campos numéricos para FormData...');
    
    // Procesar campos numéricos (FormData viene como strings)
    if (updateData.edad) updateData.edad = parseInt(updateData.edad);
    if (updateData.noPersonas) updateData.noPersonas = parseInt(updateData.noPersonas);
    if (updateData.noPersonasDiscapacitadas) updateData.noPersonasDiscapacitadas = parseInt(updateData.noPersonasDiscapacitadas);
    if (updateData.deudaActual) updateData.deudaActual = parseFloat(updateData.deudaActual);
    if (updateData.pagosRealizados) updateData.pagosRealizados = parseFloat(updateData.pagosRealizados);
    if (updateData.fechaNacimiento) updateData.fechaNacimiento = new Date(updateData.fechaNacimiento);
    
    // Procesar boolean
    if (updateData.discapacidad) updateData.discapacidad = updateData.discapacidad === 'true';

    // Si no hay discapacidad, establecer personas discapacitadas a 0
    if (updateData.discapacidad === false) {
      updateData.noPersonasDiscapacitadas = 0;
      console.log('🚫 Discapacidad = false (FormData), estableciendo noPersonasDiscapacitadas = 0');
    }

    console.log('📋 Procesando información INVI para FormData...');
    
    // Procesar información INVI si está presente
    let inviData = null;
    if (updateData.inviInfo && updateData.inviInfo !== '[object Object]') {
      try {
        // Si inviInfo es un string JSON, parsearlo
        const inviInfoParsed = typeof updateData.inviInfo === 'string' ? JSON.parse(updateData.inviInfo) : updateData.inviInfo;
        
        inviData = {
          idInvi: inviInfoParsed.idInvi || null,
          mensualidades: inviInfoParsed.mensualidades ? parseInt(inviInfoParsed.mensualidades) : null,
          deuda: inviInfoParsed.deuda ? parseFloat(inviInfoParsed.deuda) : 0,
          fechaContrato: inviInfoParsed.fechaContrato ? new Date(inviInfoParsed.fechaContrato) : null,
          idCompanero: inviInfoParsed.idCompanero || null
        };
        
        console.log('✅ Datos INVI procesados para FormData:', inviData);
        
        // Remover el objeto inviInfo del updateData principal
        delete updateData.inviInfo;
      } catch (error) {
        console.error('❌ Error procesando INVI Info:', error);
        delete updateData.inviInfo;
      }
    } else {
      delete updateData.inviInfo;
    }

    console.log('🔄 Actualizando residente con documentos en BD...');

    // Actualizar residente en la base de datos
    const resident = await prisma.resident.update({
      where: { id },
      data: {
        ...updateData,
        // Actualizar o crear información INVI si se proporcionó
        ...(inviData && {
          inviInfo: {
            upsert: {
              create: inviData,
              update: inviData
            }
          }
        })
      },
      include: {
        building: true,
        apartment: {
          include: {
            floor: true
          }
        },
        inviInfo: true
      }
    });

    res.json({
      message: 'Documentos actualizados exitosamente',
      resident
    });
  } catch (error) {
    console.error('Error al actualizar documentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cambiar estatus de residente
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { estatus } = req.body;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const resident = await prisma.resident.update({
      where: { id },
      data: { estatus: estatus.toUpperCase() }
    });

    res.json({
      message: 'Estatus actualizado exitosamente',
      resident
    });
  } catch (error) {
    console.error('Error al actualizar estatus:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar residente
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    await prisma.resident.delete({
      where: { id }
    });

    res.json({
      message: 'Residente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar residente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Asignar edificio y apartamento a un residente
router.patch('/:id/assign-building', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { buildingId, apartmentId } = req.body;

    console.log(`🏠 Asignando edificio ${buildingId} y apartamento ${apartmentId} al residente ${id}`);

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Verificar que el apartamento existe y está disponible
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: {
        floor: true,
        building: true
      }
    });

    if (!apartment) {
      return res.status(404).json({ error: 'Apartamento no encontrado' });
    }

    if (apartment.buildingId !== buildingId) {
      return res.status(400).json({ error: 'El apartamento no pertenece al edificio especificado' });
    }

    // Verificar si ya hay un residente en ese apartamento
    const existingResident = await prisma.resident.findFirst({
      where: {
        buildingId: buildingId,
        apartmentId: apartmentId
      }
    });

    if (existingResident) {
      return res.status(400).json({ error: 'El apartamento ya está ocupado por otro residente' });
    }

    // Asignar el edificio y apartamento al residente
    const updatedResident = await prisma.resident.update({
      where: { id },
      data: {
        buildingId: buildingId,
        apartmentId: apartmentId
      },
      include: {
        building: {
          select: {
            name: true
          }
        },
        apartment: {
          include: {
            floor: {
              select: {
                name: true,
                number: true
              }
            }
          }
        },
        inviInfo: true
      }
    });

    console.log(`✅ Residente ${id} asignado exitosamente`);

    res.json({
      message: 'Residente asignado exitosamente',
      resident: {
        id: updatedResident.id,
        nombre: updatedResident.nombre,
        apellido: updatedResident.apellido,
        edificio: updatedResident.building?.name,
        apartamento: updatedResident.apartment?.number,
        piso: updatedResident.apartment?.floor?.name,
        pisoNumero: updatedResident.apartment?.floor?.number,
        buildingId: updatedResident.buildingId,
        apartmentId: updatedResident.apartmentId
      }
    });
  } catch (error) {
    console.error('Error al asignar edificio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint de test simple
router.get('/test', (req, res) => {
  console.log('🧪 Endpoint de test llamado');
  res.json({ message: 'Test endpoint funcionando', timestamp: new Date().toISOString() });
});

export default router;

console.log('🏠 Rutas de residents exportadas exitosamente');
