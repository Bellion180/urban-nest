import express from 'express';
import cors from 'cors';

console.log('🔧 Iniciando servidor ultra-simple...');
console.log('Node version:', process.version);

const app = express();
const PORT = 8888; // Puerto completamente diferente

console.log('✅ Express app creado');

// Error handler para cualquier error no capturado
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

// CORS básico
app.use(cors());
console.log('✅ CORS configurado');

// Logging middleware - MUY SIMPLE
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});
console.log('✅ Logging middleware configurado');

// Body parsers
app.use(express.json());
console.log('✅ JSON parser configurado');

// Ruta simple de prueba
app.get('/test', (req, res) => {
  console.log('📍 Inside /test GET handler');
  res.json({ message: 'Ultra simple server works!', timestamp: new Date().toISOString() });
});
console.log('✅ Ruta /test configurada');

// Ruta PUT de prueba
app.put('/test/:id', (req, res) => {
  console.log('📍 Inside /test/:id PUT handler');
  console.log('ID:', req.params.id);
  console.log('Body:', req.body);
  res.json({ 
    message: 'PUT successful', 
    id: req.params.id, 
    body: req.body,
    timestamp: new Date().toISOString()
  });
});
console.log('✅ Ruta PUT /test/:id configurada');

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Express error handler:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
});
console.log('✅ Error handler configurado');

// Iniciar servidor con manejo de errores
console.log('🚀 Intentando iniciar servidor...');

const server = app.listen(PORT, '127.0.0.1', (err) => { // Forzar IPv4
  if (err) {
    console.error('❌ Error al iniciar servidor:', err);
    process.exit(1);
  }
  console.log(`✅ Servidor corriendo en http://127.0.0.1:${PORT}`);
  console.log(`📊 Test GET: http://127.0.0.1:${PORT}/test`);
  console.log(`📊 Test PUT: http://127.0.0.1:${PORT}/test/123`);
});

server.on('error', (error) => {
  console.error('❌ Server error event:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Puerto ${PORT} ya está en uso`);
  }
  process.exit(1);
});

server.on('listening', () => {
  console.log('🎉 Server listening event triggered');
  const address = server.address();
  console.log('Server address:', address);
});

console.log('📝 Script completed, servidor debería estar iniciando...');
