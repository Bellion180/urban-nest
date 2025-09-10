import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../../src/lib/prisma.js';

const router = express.Router();

// Configuración de multer para fotos de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Usar directorio temporal siempre
    const tempDir = path.join('public', 'temp-uploads');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    console.log('📁 Multer: Guardando en directorio temporal:', tempDir);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const filename = `perfil-${timestamp}${ext}`;
    console.log('📸 Multer: Nombre de archivo:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profilePhoto') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen para la foto de perfil'));
      }
    } else if (file.fieldname === 'documents') {
      if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos PDF o imágenes para documentos'));
      }
    } else {
      cb(new Error('Campo de archivo no reconocido'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  }
});

console.log('🏠 Cargando rutas de companeros...');

// Obtener todos los compañeros
router.get('/', async (req, res) => {
  try {
    console.log('🔍 API: Endpoint /companeros called');
    
    const companeros = await prisma.companeros.findMany({
      include: {
        departamento: {
          include: {
            torre: true,
            nivel: true
          }
        },
        info_financiero: true,
        financieros: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      },
      orderBy: [
        { apellidos: 'asc' },
        { nombre: 'asc' }
      ]
    });

    if (!companeros || companeros.length === 0) {
      return res.json([]);
    }

    // Mapear los datos a la estructura anterior para compatibilidad
    const mappedResidents = companeros.map(companero => {
      // Obtener información del nivel del departamento
      const nivelInfo = companero.departamento?.nivel;
      
      console.log(`🔧 Mapping companero: ${companero.nombre} - Torre: ${companero.departamento?.torre?.letra || 'SIN TORRE'} - Depto: ${companero.departamento?.nombre || 'SIN DEPTO'} - Nivel: ${nivelInfo?.numero || 'SIN NIVEL'}`);
      
      return {
        id: companero.id_companero,
        nombre: companero.nombre,
        apellido: companero.apellidos,
        edad: null, // No existe en nueva estructura
        email: null, // No existe en nueva estructura
        telefono: null, // No existe en nueva estructura
        fechaNacimiento: companero.fecha_nacimiento,
        noPersonas: companero.no_personas,
        discapacidad: companero.no_des_per > 0,
        noPersonasDiscapacitadas: companero.no_des_per,
        profilePhoto: companero.profilePhoto, // Incluir foto de perfil si existe
        documentoCurp: null, // No existe en nueva estructura
        documentoComprobanteDomicilio: null, // No existe en nueva estructura
        documentoActaNacimiento: null, // No existe en nueva estructura
        documentoIne: null, // No existe en nueva estructura
        estatus: companero.estatus,
        hasKey: false, // No existe en nueva estructura
        registrationDate: companero.createdAt,
        createdAt: companero.createdAt,
        updatedAt: companero.updatedAt,
        buildingId: companero.departamento?.id_torre,
        apartmentId: companero.id_departamento,
        deudaActual: companero.info_financiero?.deuda ? parseFloat(companero.info_financiero.deuda) : 0,
        pagosRealizados: 0, // Calcular desde financieros si es necesario
        informe: companero.info_financiero?.comentarios,
        createdById: companero.createdById,
        
        // Información INVI mapeada
        inviInfo: companero.info_financiero ? {
          idInvi: null, // No está mapeado directamente
          mensualidades: companero.info_financiero.aportacion,
          deuda: companero.info_financiero.deuda ? parseFloat(companero.info_financiero.deuda) : 0,
          fechaContrato: null, // No está mapeado directamente
          idCompanero: companero.id_companero
        } : null,
        
        // Relaciones mapeadas
        building: companero.departamento?.torre ? {
          id: companero.departamento.torre.id_torre,
          name: companero.departamento.torre.letra
        } : null,
        apartment: companero.departamento ? {
          id: companero.departamento.id_departamento,
          number: companero.departamento.nombre,
          floor: nivelInfo ? {
            id: nivelInfo.id_nivel,
            name: nivelInfo.nombre || `Nivel ${nivelInfo.numero}`,
            number: nivelInfo.numero
          } : {
            id: companero.departamento.id_torre,
            name: 'Nivel 1',
            number: 1
          }
        } : null,
        
        // Información adicional del nivel para el frontend
        piso: nivelInfo?.numero || 1,
        pisoNumero: nivelInfo?.numero || 1,
        pisoNombre: nivelInfo?.nombre || `Nivel ${nivelInfo?.numero || 1}`,
        edificio: companero.departamento?.torre?.letra || 'Sin edificio',
        apartamento: companero.departamento?.nombre || 'Sin departamento',
        
        // Información adicional mapeada desde la nueva estructura
        no_personas: companero.no_personas,
        no_des_per: companero.no_des_per,
        recibo_apoyo: companero.recibo_apoyo || 'NO',
        no_apoyo: companero.no_apoyo,
        fecha_nacimiento: companero.fecha_nacimiento,
        
        // Pagos recientes para el historial
        payments: companero.financieros ? companero.financieros.map(pago => ({
          id: pago.id_financiero,
          amount: parseFloat(pago.monto || 0),
          type: pago.tipo || 'Pago',
          description: pago.descripcion,
          date: pago.createdAt
        })) : [],
        
        // Contar pagos realizados
        pagosRealizados: companero.financieros ? companero.financieros.reduce((total, pago) => 
          total + parseFloat(pago.monto || 0), 0) : 0
      };
    });

    res.json(mappedResidents);
  } catch (error) {
    console.error('Error al obtener compañeros:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTA DE PRUEBA SIMPLE
router.get('/test-simple', async (req, res) => {
  console.log('🔥 RUTA DE PRUEBA SIMPLE LLAMADA');
  res.json({ message: 'Ruta de prueba funciona correctamente', timestamp: new Date().toISOString() });
});

// NUEVA RUTA: Obtener compañeros por edificio y nivel (debe ir antes de rutas POST/PUT)
console.log('🔧 Registrando ruta: /building/:buildingId/floor/:floorNumber');
router.get('/building/:buildingId/floor/:floorNumber', async (req, res) => {
  console.log('🔥 NUEVA RUTA LLAMADA: building/floor endpoint');
  try {
    const { buildingId, floorNumber } = req.params;
    console.log(`🔍 API: Obteniendo residentes para edificio ${buildingId}, piso ${floorNumber}`);
    
    const companeros = await prisma.companeros.findMany({
      where: {
        departamento: {
          id_torre: buildingId,
          nivel: {
            numero: parseInt(floorNumber)
          }
        }
      },
      include: {
        departamento: {
          include: {
            torre: true,
            nivel: true
          }
        },
        info_financiero: true,
        financieros: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      },
      orderBy: [
        { apellidos: 'asc' },
        { nombre: 'asc' }
      ]
    });

    console.log(`🔍 Residentes encontrados para piso ${floorNumber}: ${companeros.length}`);
    
    // Mapear los datos igual que en el endpoint principal
    const mappedResidents = companeros.map(companero => {
      const nivelInfo = companero.departamento?.nivel;
      
      return {
        id: companero.id_companero,
        nombre: companero.nombre,
        apellido: companero.apellidos,
        fechaNacimiento: companero.fecha_nacimiento,
        noPersonas: companero.no_personas,
        discapacidad: companero.no_des_per > 0,
        noPersonasDiscapacitadas: companero.no_des_per,
        estatus: companero.estatus,
        registrationDate: companero.createdAt,
        createdAt: companero.createdAt,
        updatedAt: companero.updatedAt,
        buildingId: companero.departamento?.id_torre,
        apartmentId: companero.id_departamento,
        deudaActual: companero.info_financiero?.deuda ? parseFloat(companero.info_financiero.deuda) : 0,
        informe: companero.info_financiero?.comentarios,
        
        // Información INVI mapeada
        inviInfo: companero.info_financiero ? {
          mensualidades: companero.info_financiero.aportacion,
          deuda: companero.info_financiero.deuda ? parseFloat(companero.info_financiero.deuda) : 0,
          idCompanero: companero.id_companero
        } : null,
        
        // Información adicional del nivel para el frontend
        piso: nivelInfo?.numero || 1,
        pisoNumero: nivelInfo?.numero || 1,
        pisoNombre: nivelInfo?.nombre || `Nivel ${nivelInfo?.numero || 1}`,
        edificio: companero.departamento?.torre?.letra || 'Sin edificio',
        apartamento: companero.departamento?.nombre || 'Sin departamento',
        
        // Información adicional mapeada desde la nueva estructura
        no_personas: companero.no_personas,
        no_des_per: companero.no_des_per,
        recibo_apoyo: companero.recibo_apoyo || 'NO',
        no_apoyo: companero.no_apoyo,
        fecha_nacimiento: companero.fecha_nacimiento,
        
        // Pagos recientes para el historial
        payments: companero.financieros ? companero.financieros.map(pago => ({
          id: pago.id_financiero,
          amount: parseFloat(pago.monto || 0),
          type: pago.tipo || 'Pago',
          description: pago.descripcion,
          date: pago.createdAt
        })) : [],
        
        // Contar pagos realizados
        pagosRealizados: companero.financieros ? companero.financieros.reduce((total, pago) => 
          total + parseFloat(pago.monto || 0), 0) : 0,
        
        // Relaciones mapeadas
        building: companero.departamento?.torre ? {
          id: companero.departamento.torre.id_torre,
          name: companero.departamento.torre.letra
        } : null,
        apartment: companero.departamento ? {
          id: companero.departamento.id_departamento,
          number: companero.departamento.nombre,
          floor: nivelInfo ? {
            id: nivelInfo.id_nivel,
            name: nivelInfo.nombre || `Nivel ${nivelInfo.numero}`,
            number: nivelInfo.numero
          } : null
        } : null,
        
        // Información adicional del nivel para el frontend
        piso: nivelInfo?.numero || 1,
        pisoNombre: nivelInfo?.nombre || `Nivel ${nivelInfo?.numero || 1}`,
        pisoNumero: nivelInfo?.numero || 1,
        edificio: companero.departamento?.torre?.letra || 'Sin edificio',
        apartamento: companero.departamento?.no_departamento || 'Sin departamento'
      };
    });

    res.json(mappedResidents);
  } catch (error) {
    console.error('Error al obtener residentes por piso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo compañero (con foto de perfil)
router.post('/', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'documents', maxCount: 10 }
]), async (req, res) => {
  try {
    console.log('=== POST /companeros ===');
    console.log('Request body:', req.body);
    console.log('Usuario:', req.user);
    console.log('Headers:', req.headers);
    
    const {
      nombre,
      apellidos,
      fecha_nacimiento,
      no_personas,
      no_des_per,
      recibo_apoyo,
      no_apoyo,
      id_departamento
    } = req.body;

    console.log('Datos extraídos:', {
      nombre,
      apellidos,
      fecha_nacimiento,
      no_personas,
      no_des_per,
      recibo_apoyo,
      no_apoyo,
      id_departamento
    });

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      console.log('❌ Acceso denegado - rol:', req.user.role);
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    console.log('✅ Usuario autorizado como admin');

    // Verificar que el departamento existe
    if (id_departamento) {
      console.log('🔍 Verificando departamento:', id_departamento);
      const departamento = await prisma.departamentos.findUnique({
        where: { id_departamento }
      });
      
      if (!departamento) {
        console.log('❌ Departamento no encontrado:', id_departamento);
        return res.status(400).json({ error: 'Departamento no encontrado' });
      }
      console.log('✅ Departamento encontrado:', departamento.nombre);
    }

    console.log('🔧 Creando compañero...');
    const companero = await prisma.companeros.create({
      data: {
        nombre,
        apellidos,
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
        no_personas: no_personas ? parseInt(no_personas) : null,
        no_des_per: no_des_per ? parseInt(no_des_per) : 0,
        recibo_apoyo,
        no_apoyo: no_apoyo ? parseInt(no_apoyo) : null,
        id_departamento,
        createdById: req.user.id
      },
      include: {
        departamento: {
          include: {
            torre: true,
            nivel: true
          }
        },
        info_financiero: true
      }
    });

    console.log('✅ Compañero creado exitosamente:', companero.id_companero);

    // Procesar archivos si se subieron
    let profilePhotoPath = null;
    let processedDocuments = [];
    
    if (companero.departamento && req.files) {
      const torreId = companero.departamento.id_torre || 'sin-torre';
      const nivelNumero = companero.departamento.nivel?.numero || 1;
      const deptNumero = companero.departamento.no_departamento || companero.departamento.nombre || 'sin-numero';
      
      console.log('📁 Datos para crear carpeta:', {
        torreId,
        nivelNumero,
        deptNumero,
        torreLetra: companero.departamento.torre?.letra
      });
      
      // Crear estructura de carpetas siguiendo el patrón de edificios y pisos
      const finalDir = path.join('public', 'edificios', torreId, 'pisos', nivelNumero.toString(), 'departamentos', deptNumero);
      
      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
        console.log('📁 Directorio creado:', finalDir);
      }
      
      // Procesar foto de perfil
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        console.log('📸 Procesando foto de perfil...');
        const profileFile = req.files.profilePhoto[0];
        const finalPhotoPath = path.join(finalDir, 'perfil.jpg');
        
        try {
          fs.renameSync(profileFile.path, finalPhotoPath);
          profilePhotoPath = `/edificios/${torreId}/pisos/${nivelNumero}/departamentos/${deptNumero}/perfil.jpg`;
          
          // Actualizar el companero con la ruta de la foto
          await prisma.companeros.update({
            where: { id_companero: companero.id_companero },
            data: { profilePhoto: profilePhotoPath }
          });
          
          console.log('✅ Foto de perfil guardada:', profilePhotoPath);
          
        } catch (photoError) {
          console.error('❌ Error procesando foto:', photoError);
        }
      }
      
      // Procesar documentos
      if (req.files.documents && req.files.documents.length > 0) {
        console.log('📄 Procesando documentos...');
        
        for (let i = 0; i < req.files.documents.length; i++) {
          const docFile = req.files.documents[i];
          const extension = path.extname(docFile.originalname) || (docFile.mimetype === 'application/pdf' ? '.pdf' : '.jpg');
          const finalDocPath = path.join(finalDir, `documento_${i + 1}${extension}`);
          
          try {
            fs.renameSync(docFile.path, finalDocPath);
            const docUrl = `/edificios/${torreId}/pisos/${nivelNumero}/departamentos/${deptNumero}/documento_${i + 1}${extension}`;
            processedDocuments.push(docUrl);
            console.log(`✅ Documento ${i + 1} guardado:`, docUrl);
          } catch (docError) {
            console.error(`❌ Error procesando documento ${i + 1}:`, docError);
          }
        }
        
        // Actualizar el companero con los documentos si se procesaron
        if (processedDocuments.length > 0) {
          await prisma.companeros.update({
            where: { id_companero: companero.id_companero },
            data: { 
              documentos: processedDocuments,
              // Mapear documentos específicos si son reconocidos por nombre
              ...(processedDocuments.length >= 1 && { documentoIne: processedDocuments[0] }),
              ...(processedDocuments.length >= 2 && { documentoCurp: processedDocuments[1] }),
              ...(processedDocuments.length >= 3 && { documentoComprobanteDomicilio: processedDocuments[2] }),
              ...(processedDocuments.length >= 4 && { documentoActaNacimiento: processedDocuments[3] })
            }
          });
          console.log('✅ Documentos guardados en BD:', processedDocuments);
        }
      }
    } else if (req.files) {
      console.log('⚠️ Archivos subidos pero sin departamento asignado, eliminando archivos temporales');
      try {
        // Limpiar archivos temporales
        if (req.files.profilePhoto) {
          req.files.profilePhoto.forEach(file => fs.unlinkSync(file.path));
        }
        if (req.files.documents) {
          req.files.documents.forEach(file => fs.unlinkSync(file.path));
        }
      } catch (cleanupError) {
        console.error('❌ Error limpiando archivos temporales:', cleanupError);
      }
    }

    res.status(201).json({
      message: 'Compañero creado exitosamente',
      companero: {
        ...companero,
        profilePhoto: profilePhotoPath || companero.profilePhoto,
        documentos: processedDocuments
      }
    });
  } catch (error) {
    console.error('❌ Error al crear compañero:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Request body:', req.body);
    console.error('❌ Request files:', req.files);
    
    // Limpiar archivos temporales si hay error
    if (req.files) {
      try {
        if (req.files.profilePhoto) {
          req.files.profilePhoto.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
              console.log('🗑️ Archivo temporal limpiado:', file.path);
            }
          });
        }
        if (req.files.documents) {
          req.files.documents.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
              console.log('🗑️ Archivo temporal limpiado:', file.path);
            }
          });
        }
      } catch (cleanupError) {
        console.error('❌ Error limpiando archivos temporales:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Algo salió mal!',
      details: error.message,
      stage: 'creating_companero'
    });
  }
});

// Actualizar compañero
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Procesar campos numéricos
    if (updateData.no_personas) updateData.no_personas = parseInt(updateData.no_personas);
    if (updateData.no_des_per) updateData.no_des_per = parseInt(updateData.no_des_per);
    if (updateData.no_apoyo) updateData.no_apoyo = parseInt(updateData.no_apoyo);
    if (updateData.fecha_nacimiento) updateData.fecha_nacimiento = new Date(updateData.fecha_nacimiento);

    // Si no hay discapacidad, establecer personas discapacitadas a 0
    if (updateData.discapacidad === false || updateData.no_des_per === 0) {
      updateData.no_des_per = 0;
    }

    // Limpiar campos que no pertenecen a la tabla companeros
    delete updateData.id;
    delete updateData.discapacidad;
    delete updateData.edad;
    delete updateData.email;
    delete updateData.telefono;
    delete updateData.deudaActual;
    delete updateData.pagosRealizados;
    delete updateData.inviInfo;

    const companero = await prisma.companeros.update({
      where: { id_companero: id },
      data: updateData,
      include: {
        departamento: {
          include: {
            torre: true
          }
        },
        info_financiero: true
      }
    });

    res.json({
      message: 'Compañero actualizado exitosamente',
      companero
    });
  } catch (error) {
    console.error('Error al actualizar compañero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar compañero
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    await prisma.companeros.delete({
      where: { id_companero: id }
    });

    res.json({
      message: 'Compañero eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar compañero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Realizar pago
router.post('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    // Obtener o crear info financiero
    let infoFinanciero = await prisma.info_Financiero.findUnique({
      where: { id_companeros: id }
    });

    if (!infoFinanciero) {
      infoFinanciero = await prisma.info_Financiero.create({
        data: {
          id_companeros: id,
          deuda: '0',
          aportacion: '0'
        }
      });
    }

    const currentDeuda = parseFloat(infoFinanciero.deuda || '0');
    const newDeuda = Math.max(0, currentDeuda - paymentAmount);

    // Actualizar info financiero
    await prisma.info_Financiero.update({
      where: { id_companeros: id },
      data: {
        deuda: newDeuda.toString()
      }
    });

    // Registrar en financieros
    await prisma.financieros.create({
      data: {
        validez: 'PAGO_REALIZADO',
        aportaciones: paymentAmount.toString(),
        id_companeros: id
      }
    });

    res.json({
      message: 'Pago registrado exitosamente',
      previousDebt: currentDeuda,
      paymentAmount: paymentAmount,
      newDebt: newDeuda
    });
  } catch (error) {
    console.error('Error al procesar pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener torres con sus niveles y departamentos
router.get('/departments', async (req, res) => {
  try {
    console.log('🏠 GET /departments - Obteniendo estructura completa...');
    
    // Obtener todas las torres con sus niveles y departamentos
    const torres = await prisma.torres.findMany({
      select: {
        id_torre: true,
        letra: true,
        descripcion: true,
        niveles: {
          select: {
            id_nivel: true,
            nombre: true,
            numero: true,
            departamentos: {
              select: {
                id_departamento: true,
                nombre: true,
                no_departamento: true
              },
              orderBy: {
                no_departamento: 'asc'
              }
            }
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

    console.log(`🏢 Torres encontradas: ${torres.length}`);
    
    // Mapear la estructura para el frontend
    const mappedData = torres.map(torre => ({
      id: torre.id_torre,
      name: torre.descripcion || `Torre ${torre.letra}`,
      letter: torre.letra,
      levels: torre.niveles.map(nivel => ({
        id: nivel.id_nivel,
        name: nivel.nombre,
        number: nivel.numero,
        departments: nivel.departamentos.map(dept => ({
          id: dept.id_departamento,
          number: dept.no_departamento,
          name: dept.nombre || dept.no_departamento
        }))
      }))
    }));

    res.json(mappedData);
  } catch (error) {
    console.error('❌ Error al obtener estructura:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

console.log('✅ Rutas de companeros cargadas exitosamente');

export { router as companerosRoutes };
