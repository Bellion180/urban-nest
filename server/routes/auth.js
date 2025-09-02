import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../src/lib/prisma.js';

const router = express.Router();

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    console.log('Backend: Solicitud de login recibida:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario en la base de datos
    const dbUser = await prisma.user.findFirst({
      where: { email: email }
    });
    
    if (!dbUser) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar que el rol sea ADMIN o USER (no permitir RESIDENT)
    if (dbUser.role === 'RESIDENT') {
      return res.status(403).json({ error: 'Los residentes no están autorizados a iniciar sesión' });
    }
    
    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, dbUser.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token
    const token = jwt.sign(
      { userId: dbUser.id, email: dbUser.email, role: dbUser.role },
      process.env.JWT_SECRET || 'secret_key_for_development',
      { expiresIn: '24h' }
    );

    // Extraer nombre y apellido
    const nameParts = dbUser.name.split(' ');
    const nombre = nameParts[0] || '';
    const apellido = nameParts.slice(1).join(' ') || '';
    
    return res.json({
      message: 'Login exitoso',
      user: {
        id: dbUser.id,
        email: dbUser.email,
        nombre: nombre,
        apellido: apellido,
        role: dbUser.role
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_for_development');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const nameParts = user.name.split(' ');
    const nombre = nameParts[0] || '';
    const apellido = nameParts.slice(1).join(' ') || '';
    
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        nombre: nombre,
        apellido: apellido,
        role: user.role
      } 
    });
  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;
