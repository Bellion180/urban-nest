import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { prisma } from '../src/lib/prisma.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import buildingRoutes from './routes/buildings.js';
import paymentRoutes from './routes/payments.js';
import { companerosRoutes } from './routes/companeros.js';
import { torresRoutes } from './routes/torres.js';
import { nivelesRoutes } from './routes/niveles.js';

// Importar middlewares
import authMiddleware, { adminMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración CORS
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

console.log('🔧 Configurando middlewares...');
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/edificios', express.static(path.join(process.cwd(), 'public', 'edificios')));
app.use(express.static(path.join(process.cwd(), 'public')));

// Rutas de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Cargar rutas
console.log('🏠 Cargando rutas...');
app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/companeros', companerosRoutes);
app.use('/api/torres', torresRoutes);
app.use('/api/niveles', nivelesRoutes);

// Función para iniciar el servidor
async function startServer() {
  try {
    console.log('✅ Conexión a MySQL establecida');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
      console.log('🔧 CORS habilitado para todos los orígenes');
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor sin manejadores de señales problemáticos
startServer().catch(console.error);
