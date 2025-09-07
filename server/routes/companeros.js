import express from 'express';
import { prisma } from '../../src/lib/prisma.js';

const router = express.Router();

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
            niveles: {
              include: {
                nivel: true
              }
            }
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

    console.log(`🔍 Companeros found: ${companeros.length}`);
    
    // Mapear los datos a la estructura anterior para compatibilidad
    const mappedResidents = companeros.map(companero => {
      // Obtener información del nivel del departamento
      const nivelInfo = companero.departamento?.niveles?.[0]?.nivel;
      
      console.log(`🔧 Mapping companero: ${companero.nombre} - Torre: ${companero.departamento?.torre?.letra || 'SIN TORRE'} - Depto: ${companero.departamento?.no_departamento || 'SIN DEPTO'} - Nivel: ${nivelInfo?.numero || 'SIN NIVEL'}`);
      
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
        profilePhoto: null, // No existe en nueva estructura
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
          number: companero.departamento.no_departamento,
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
        pisoNombre: nivelInfo?.nombre || `Nivel ${nivelInfo?.numero || 1}`,
        edificio: companero.departamento?.torre?.letra || 'Sin edificio',
        apartamento: companero.departamento?.no_departamento || 'Sin departamento'
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
          niveles: {
            some: {
              nivel: {
                numero: parseInt(floorNumber)
              }
            }
          }
        }
      },
      include: {
        departamento: {
          include: {
            torre: true,
            niveles: {
              include: {
                nivel: true
              }
            }
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
      const nivelInfo = companero.departamento?.niveles?.[0]?.nivel;
      
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
        
        // Relaciones mapeadas
        building: companero.departamento?.torre ? {
          id: companero.departamento.torre.id_torre,
          name: companero.departamento.torre.letra
        } : null,
        apartment: companero.departamento ? {
          id: companero.departamento.id_departamento,
          number: companero.departamento.no_departamento,
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

// Crear nuevo compañero
router.post('/', async (req, res) => {
  try {
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

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Verificar que el departamento existe
    if (id_departamento) {
      const departamento = await prisma.departamentos.findUnique({
        where: { id_departamento }
      });
      
      if (!departamento) {
        return res.status(400).json({ error: 'Departamento no encontrado' });
      }
    }

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
        createdById: req.user.userId
      },
      include: {
        departamento: {
          include: {
            torre: true
          }
        },
        info_financiero: true
      }
    });

    res.status(201).json({
      message: 'Compañero creado exitosamente',
      companero
    });
  } catch (error) {
    console.error('Error al crear compañero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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

console.log('✅ Rutas de companeros cargadas exitosamente');

export { router as companerosRoutes };
