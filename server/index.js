import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001; // Volvemos al puerto original

console.log('🔧 Iniciando servidor simplificado...');
console.log('🧪 TEST: console.log funciona correctamente');

// CORS
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

console.log('🧪 TEST: CORS configurado');
console.log('🧪 TEST: Verificando app object:', typeof app);
console.log('🧪 TEST: Verificando app.use:', typeof app.use);

// Logging middleware - DEBE ejecutarse primero
const loggingMiddleware = (req, res, next) => {
  console.log('🚨 MIDDLEWARE EJECUTADO!!!');
  console.log(`\n🔍 REQUEST: ${req.method} ${req.url}`);
  console.log(`🕐 Time: ${new Date().toISOString()}`);
  console.log(`📄 Headers:`, req.headers);
  next();
};

console.log('🧪 TEST: Middleware function created:', typeof loggingMiddleware);

try {
  app.use(loggingMiddleware);
  console.log('🧪 TEST: ✅ Middleware registered successfully');
} catch (error) {
  console.log('🧪 TEST: ❌ Error registering middleware:', error);
}

console.log('🧪 TEST: Middleware de logging configurado');

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware adicional después de parsers
app.use((req, res, next) => {
  console.log(`📦 Body:`, req.body);
  console.log(`═══════════════════════════════`);
  next();
});

// Rutas de prueba
app.get('/api/health', (req, res) => {
  console.log('📍 Dentro del handler /api/health');
  res.json({ 
    status: 'ok',
    message: '🚨 SERVIDOR SIMPLIFICADO EN PUERTO 3009 🚨', 
    timestamp: new Date().toISOString(),
    server: 'Express Debug Server'
  });
});

app.put('/api/test/:id', (req, res) => {
  console.log('📍 Dentro del handler PUT /api/test/:id');
  console.log('ID:', req.params.id);
  console.log('Body:', req.body);
  res.json({ 
    message: 'PUT exitoso', 
    id: req.params.id, 
    body: req.body 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ ERROR HANDLER:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor simplificado corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`� Test PUT: http://localhost:${PORT}/api/test/123`);
});
