import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from '../src/lib/prisma.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import buildingRoutes from './routes/buildings.js';
import residentRoutes from './routes/residents.js';
import paymentRoutes from './routes/payments.js';

// Importar middlewares
import authMiddleware, { adminMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = 3001;

console.log('🔧 Iniciando servidor Urban Nest con debugging...');

// CORS
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Logging middleware - DEBE ejecutarse primero
app.use((req, res, next) => {
  console.log(`\n🔍 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  console.log(`📄 Headers:`, req.headers.authorization ? 'Token present' : 'No token');
  next();
});

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging después de parsers
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body:`, req.body);
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('📍 Health check ejecutado');
  res.json({ 
    status: 'ok',
    message: 'Urban Nest API con debugging', 
    timestamp: new Date().toISOString()
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas protegidas con logging específico
app.use('/api/buildings', (req, res, next) => {
  console.log(`🏢 Buildings route: ${req.method} ${req.url}`);
  next();
}, authMiddleware, buildingRoutes);

app.use('/api/residents', authMiddleware, residentRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error handler:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicializar servidor
async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión a MySQL establecida');

    const server = app.listen(PORT, () => {
      console.log(`✅ Servidor Urban Nest corriendo en http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health`);
    });

    return server;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer().catch((error) => {
  console.error('❌ Error fatal al iniciar servidor:', error);
  process.exit(1);
});

// Manejo de cierre graceful - COMENTADO TEMPORALMENTE PARA DEBUG
/*
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
*/
