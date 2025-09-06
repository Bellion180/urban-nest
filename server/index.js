import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { prisma } from '../src/lib/prisma.js';

// Importar rutas
import authRoutes from './routes/auth.js';
// import buildingRoutes from './routes/buildings.js';  // Reemplazado por torresRoutes
// import residentRoutes from './routes/residents.js';  // Reemplazado por companerosRoutes
import paymentRoutes from './routes/payments.js';
import { companerosRoutes } from './routes/companeros.js';
import { torresRoutes } from './routes/torres.js';

// Importar middlewares
import authMiddleware, { adminMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración CORS simple pero completa para desarrollo
const corsOptions = {
  origin: true, // Permite todos los orígenes en desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Aplica CORS a todas las rutas
app.use(cors(corsOptions));

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de todas las peticiones (antes de archivos estáticos para debug)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use(express.static('public'));

// Servir archivos estáticos desde la carpeta public
app.use('/edificios', express.static('public/edificios'));

// Health check (solo una definición)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Urban Nest API funcionando correctamente', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint específico para servir documentos
app.get('/api/documents/:buildingId/:floor/:apartment/:filename', (req, res) => {
  const { buildingId, floor, apartment, filename } = req.params;
  const filePath = `edificios/${buildingId}/pisos/${floor}/apartamentos/${apartment}/${filename}`;
  const fullPath = path.join(process.cwd(), 'public', filePath);
  
  console.log('📄 Solicitud de documento:', filePath);
  console.log('📂 Ruta completa:', fullPath);
  
  if (fs.existsSync(fullPath)) {
    console.log('✅ Archivo existe, enviando...');
    res.sendFile(fullPath);
  } else {
    console.log('❌ Archivo no encontrado');
    res.status(404).json({ error: 'Documento no encontrado' });
  }
});

// Rutas
// Configurar preflight requests para rutas específicas
app.options('/api/auth/login', cors(corsOptions));
app.options('/api/auth/register', cors(corsOptions));
app.options('/api/auth/verify', cors(corsOptions));
app.use('/api/auth', authRoutes); // No requiere autenticación previa

// Rutas protegidas - Nuevas rutas principales
app.use('/api/companeros', authMiddleware, companerosRoutes);
app.use('/api/torres', authMiddleware, torresRoutes);

// Rutas de compatibilidad - redirigir a las nuevas rutas
app.use('/api/buildings', authMiddleware, torresRoutes); 
app.use('/api/residents', authMiddleware, (req, res, next) => {
  console.log('🔀 Redirección: /api/residents -> /api/companeros', req.method, req.path);
  next();
}, companerosRoutes); 
app.use('/api/payments', authMiddleware, paymentRoutes);

// Alias para compatibilidad - mapear las rutas anteriores a las nuevas
app.use('/api/residents-legacy', authMiddleware, companerosRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Inicializar servidor
async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión a MySQL establecida');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🔧 CORS habilitado para todos los orígenes`);
    });

    // Retornar el servidor para mantener la referencia
    return server;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await prisma.$disconnect();
  console.log('🔌 Desconectado de la base de datos');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await prisma.$disconnect();
  console.log('🔌 Desconectado de la base de datos');
  process.exit(0);
});

// Iniciar el servidor
startServer().catch(console.error);
