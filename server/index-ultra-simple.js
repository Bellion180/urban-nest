import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

console.log('🔧 Servidor ultra-simplificado para debug...');

// CORS
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`\n🔍 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    message: 'Servidor ultra-simplificado', 
    timestamp: new Date().toISOString()
  });
});

// Simular auth middleware simplificado
const simpleAuthMiddleware = (req, res, next) => {
  console.log('🔐 Auth middleware ejecutado');
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  
  // Simular usuario válido
  req.user = {
    id: 'test-user-id',
    email: 'test@test.com',
    role: 'ADMIN'
  };
  
  console.log('✅ Auth middleware exitoso');
  next();
};

// Rutas de buildings simplificadas
app.get('/api/buildings', simpleAuthMiddleware, (req, res) => {
  console.log('📍 GET /api/buildings ejecutado');
  res.json([
    {
      id: 'cmf1qf5q70000favk4pnaowag',
      name: 'Edificio Test',
      description: 'Descripción test'
    }
  ]);
});

app.put('/api/buildings/:id', simpleAuthMiddleware, (req, res) => {
  console.log('📍 PUT /api/buildings/:id ejecutado');
  console.log('ID:', req.params.id);
  console.log('Body:', req.body);
  console.log('User:', req.user);
  
  res.json({
    message: 'Edificio actualizado exitosamente',
    id: req.params.id,
    data: req.body
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error handler:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`✅ Servidor ultra-simplificado corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Buildings: http://localhost:${PORT}/api/buildings`);
});

// Capturar errores del servidor
server.on('error', (error) => {
  console.error('❌ Error del servidor:', error);
});

// Capturar errores no manejados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Mantener el proceso vivo
setInterval(() => {
  console.log('💓 Servidor sigue vivo...', new Date().toISOString());
}, 5000);
