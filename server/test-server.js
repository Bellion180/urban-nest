const express = require('express');
const cors = require('cors');
const app = express();

// CORS permisivo para desarrollo
app.use(cors({ 
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Endpoint de health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested from:', req.get('origin'));
  res.json({ 
    status: 'OK', 
    message: 'Servidor de prueba funcionando',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de login básico
app.post('/api/auth/login', (req, res) => {
  console.log('✅ Login requested:', req.body);
  console.log('✅ Request origin:', req.get('origin'));
  
  // Simulación de login exitoso
  res.json({ 
    token: 'test-token-12345', 
    user: { 
      id: 1, 
      email: req.body.email || 'admin', 
      role: 'ADMIN',
      name: 'Usuario de Prueba'
    },
    message: 'Login exitoso'
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de prueba corriendo en http://localhost:${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`🔧 CORS habilitado para todos los orígenes`);
});

// Mantener el proceso activo
setInterval(() => {
  console.log(`⏰ Servidor activo: ${new Date().toISOString()}`);
}, 60000); // Cada minuto

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n🔄 Cerrando servidor de prueba...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});
