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
const PORT = process.env.PORT || 3001;

// Configuración CORS más simple y permisiva para desarrollo (funcionó en el servidor de prueba)
const corsOptions = {
  origin: true, // Permite todos los orígenes en desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Aplica CORS a todas las rutas
app.use(cors(corsOptions));

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check (solo una definición)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Urban Nest API funcionando correctamente', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas
// Configurar preflight requests para rutas específicas
app.options('/api/auth/login', cors(corsOptions));
app.options('/api/auth/register', cors(corsOptions));
app.options('/api/auth/verify', cors(corsOptions));
app.use('/api/auth', authRoutes); // No requiere autenticación previa

// Rutas protegidas
app.use('/api/buildings', authMiddleware, buildingRoutes);
app.use('/api/residents', authMiddleware, residentRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);

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
