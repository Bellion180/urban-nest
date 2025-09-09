import express from 'express';

const app = express();
const PORT = 3002;

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Puerto alternativo funcionando',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

try {
  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Servidor en puerto alternativo: http://localhost:${PORT}`);
    console.log(`📊 Test: http://localhost:${PORT}/test`);
  });
  
  server.on('error', (error) => {
    console.error('❌ Error del servidor:', error.message);
  });
  
} catch (error) {
  console.error('💥 Error al iniciar servidor:', error.message);
}
