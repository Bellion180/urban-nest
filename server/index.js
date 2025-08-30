import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from '../src/lib/prisma.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import buildingRoutes from './routes/buildings.js';
import residentRoutes from './routes/residents.js';
import paymentRoutes from './routes/payments.js';
import buildingsRoutes from './routes/buildings.js';
import residentsRoutes from './routes/residents.js';
import paymentsRoutes from './routes/payments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/payments', paymentRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ message: 'Urban Nest API funcionando correctamente', timestamp: new Date().toISOString() });
});

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

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Desconectado de la base de datos');
});

startServer();
