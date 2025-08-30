import express from 'express';
import { prisma } from '../../src/lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los residentes
router.get('/', authMiddleware, async (req, res) => {
  try {
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
        }
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });

    const formattedResidents = residents.map(resident => ({
      id: resident.id,
      nombre: resident.nombre,
      apellido: resident.apellido,
      edad: resident.edad,
      email: resident.email,
      telefono: resident.telefono,
      fechaNacimiento: resident.fechaNacimiento,
      noPersonas: resident.noPersonas,
      discapacidad: resident.discapacidad,
      profilePhoto: resident.profilePhoto,
      estatus: resident.estatus,
      hasKey: resident.hasKey,
      registrationDate: resident.registrationDate,
      deudaActual: resident.deudaActual,
      pagosRealizados: resident.pagosRealizados,
      informe: resident.informe,
      edificio: resident.building.name,
      apartamento: resident.apartment.number,
      piso: resident.apartment.floor.name,
      recentPayments: resident.payments
    }));

    res.json(formattedResidents);
  } catch (error) {
    console.error('Error al obtener residentes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo residente
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      edad,
      email,
      telefono,
      fechaNacimiento,
      noPersonas,
      discapacidad,
      profilePhoto,
      buildingId,
      apartmentNumber,
      floorNumber,
      deudaActual,
      pagosRealizados,
      informe
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
          number: floorNumber
        }
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

    const resident = await prisma.resident.create({
      data: {
        nombre,
        apellido,
        edad: edad ? parseInt(edad) : null,
        email,
        telefono,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        noPersonas: noPersonas ? parseInt(noPersonas) : null,
        discapacidad: discapacidad === 'si',
        profilePhoto,
        buildingId,
        apartmentId: apartment.id,
        deudaActual: deudaActual ? parseFloat(deudaActual) : 0,
        pagosRealizados: pagosRealizados ? parseFloat(pagosRealizados) : 0,
        informe,
        createdById: req.user.userId
      },
      include: {
        building: true,
        apartment: {
          include: {
            floor: true
          }
        }
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

// Actualizar residente
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Procesar campos numéricos
    if (updateData.edad) updateData.edad = parseInt(updateData.edad);
    if (updateData.noPersonas) updateData.noPersonas = parseInt(updateData.noPersonas);
    if (updateData.deudaActual) updateData.deudaActual = parseFloat(updateData.deudaActual);
    if (updateData.pagosRealizados) updateData.pagosRealizados = parseFloat(updateData.pagosRealizados);
    if (updateData.fechaNacimiento) updateData.fechaNacimiento = new Date(updateData.fechaNacimiento);

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
    console.error('Error al actualizar residente:', error);
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

export default router;
