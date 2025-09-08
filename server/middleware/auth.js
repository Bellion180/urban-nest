import jwt from 'jsonwebtoken';
import { prisma } from '../../src/lib/prisma.js';

export const authMiddleware = async (req, res, next) => {
  try {
    console.log(`🔐 Auth middleware - ${req.method} ${req.path}`);
    console.log('🔐 Headers:', req.headers.authorization);
    
    // Obtener token del encabezado Authorization
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso no autorizado. Token no proporcionado.' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Añadir usuario al objeto de solicitud para uso posterior
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar rol de administrador
export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  
  next();
};

export default authMiddleware;
