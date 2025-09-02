import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../src/lib/prisma.js';

const router = express.Router();

// Middleware para manejar errores de autenticación de manera consistente
const handleAuthError = (res, status, message) => {
  console.error(`Error de autenticación: ${status} - ${message}`);
  return res.status(status).json({ error: message });
};

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    console.log('Solicitud de registro recibida:', req.body);
    const { email, password, name, role = 'RESIDENT' } = req.body;

    // Validación de datos
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Validar el rol (debe ser ADMIN o RESIDENT según el enum)
    if (role !== 'ADMIN' && role !== 'RESIDENT') {
      return res.status(400).json({ error: 'Rol inválido. Debe ser ADMIN o RESIDENT' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creando usuario con rol:', role);
    
    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    console.log('Usuario creado:', user);

    // Generar token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_key_for_development',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user,
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    console.log('Backend: Solicitud de login recibida:', req.body);
    
    // Validación de datos de entrada
    if (!req.body) {
      console.log('Error: Cuerpo de solicitud vacío');
      return res.status(400).json({ error: 'Solicitud inválida: cuerpo vacío' });
    }
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Error de validación: Email o contraseña faltantes');
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Usuarios de prueba para desarrollo (mantener compatibilidad con frontend)
    const demoUsers = {
      'admin': { email: 'admin', password: 'admin123', role: 'ADMIN', name: 'Administrador' },
      'user': { email: 'user', password: 'user123', role: 'USER', name: 'Usuario' },
      'resident': { email: 'resident', password: 'resident123', role: 'RESIDENT', name: 'Residente' }
    };

    // Buscar primero en la base de datos
    console.log('Backend: Buscando usuario en la base de datos. Email:', email);
    let dbUser;
    
    try {
      dbUser = await prisma.user.findFirst({
        where: { 
          email: email 
        }
      });
    } catch (dbError) {
      console.error('Backend: Error al consultar la base de datos:', dbError);
      return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
    
    // Si se encontró el usuario en la base de datos
    if (dbUser) {
      console.log('Backend: Usuario encontrado en la base de datos, ID:', dbUser.id, 'Role:', dbUser.role);
      
      // Verificar que el rol sea ADMIN o USER (no permitir RESIDENT)
      if (dbUser.role === 'RESIDENT') {
        console.log('Backend: Acceso denegado para residentes. Role:', dbUser.role);
        return res.status(403).json({ error: 'Los residentes no están autorizados a iniciar sesión' });
      }
      
      // Verificar contraseña
      try {
        const isPasswordValid = await bcrypt.compare(password, dbUser.password);
        
        if (!isPasswordValid) {
          console.log('Backend: Contraseña incorrecta para usuario de base de datos');
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        console.log('Backend: Contraseña validada correctamente');
      } catch (bcryptError) {
        console.error('Backend: Error al verificar contraseña:', bcryptError);
        return res.status(500).json({ error: 'Error al verificar las credenciales' });
      }
      
      console.log('Login exitoso con usuario de base de datos, rol:', dbUser.role);
      
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
    }
    
    // Si no se encontró en la base de datos, verificar si es usuario de prueba
    const demoUser = Object.values(demoUsers).find(u => u.email === email);
    console.log('Backend: ¿Usuario demo encontrado?', !!demoUser, 'Email:', email);
    
    if (demoUser && demoUser.password === password) {
      console.log('Backend: Inicio de sesión con usuario demo exitoso, Role:', demoUser.role);
      
      // Verificar que el rol sea ADMIN o USER (no permitir RESIDENT)
      if (demoUser.role === 'RESIDENT') {
        console.log('Backend: Acceso denegado para residentes demo');
        return res.status(403).json({ error: 'Los residentes no están autorizados a iniciar sesión' });
      }
      
      try {
        // Generar un ID temporal para usuario de prueba
        const userId = `demo_${Date.now()}`;
        
        // Generar token para usuario de prueba
        const token = jwt.sign(
          { userId, email: demoUser.email, role: demoUser.role },
          process.env.JWT_SECRET || 'secret_key_for_development',
          { expiresIn: '24h' }
        );
        
        return res.json({
          message: 'Login exitoso (usuario de prueba)',
          user: {
            id: userId,
            email: demoUser.email,
            nombre: demoUser.name.split(' ')[0],
            apellido: demoUser.name.includes(' ') ? demoUser.name.split(' ')[1] : '',
            role: demoUser.role
          },
          token
        });
      } catch (tokenError) {
        console.error('Backend: Error al generar token para usuario demo:', tokenError);
        return res.status(500).json({ error: 'Error al generar credenciales' });
      }
    }
    
    // Si no se encontró ni en la base de datos ni como usuario demo
    console.log('Backend: Usuario no encontrado en base de datos ni como usuario demo');
    return res.status(401).json({ error: 'Credenciales inválidas' });

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
    console.log('Token verificado:', decoded);
    
    // Verificar si es un usuario de demo
    if (decoded.userId && decoded.userId.toString().startsWith('demo_')) {
      console.log('Verificación de token para usuario demo');
      return res.json({ 
        user: {
          id: decoded.userId,
          email: decoded.email,
          nombre: decoded.email === 'admin' ? 'Administrador' : 
                 decoded.email === 'user' ? 'Usuario' : 'Residente',
          apellido: '',
          role: decoded.role
        } 
      });
    }
    
    // Buscar usuario en la base de datos
    console.log('Buscando usuario con ID:', decoded.userId);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      console.log('Usuario no encontrado en verificación de token');
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    console.log('Usuario encontrado en verificación de token:', user.email);
    
    // Extraer nombre y apellido
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
