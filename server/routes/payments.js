import express from 'express';
import { prisma } from '../../src/lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Obtener pagos de un residente
router.get('/resident/:residentId', authMiddleware, async (req, res) => {
  try {
    const { residentId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { residentId },
      include: {
        resident: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(payments);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo pago
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      residentId,
      amount,
      type,
      description,
      date
    } = req.body;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const payment = await prisma.payment.create({
      data: {
        residentId,
        amount: parseFloat(amount),
        type,
        description,
        date: date ? new Date(date) : new Date()
      },
      include: {
        resident: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });

    // Actualizar pagos realizados del residente
    await prisma.resident.update({
      where: { id: residentId },
      data: {
        pagosRealizados: {
          increment: parseFloat(amount)
        }
      }
    });

    res.status(201).json({
      message: 'Pago registrado exitosamente',
      payment
    });
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas de pagos
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const stats = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    const paymentsByType = await prisma.payment.groupBy({
      by: ['type'],
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    const recentPayments = await prisma.payment.findMany({
      take: 10,
      include: {
        resident: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json({
      totalAmount: stats._sum.amount || 0,
      totalPayments: stats._count || 0,
      paymentsByType,
      recentPayments
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
