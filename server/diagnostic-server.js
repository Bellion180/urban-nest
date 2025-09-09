import express from 'express';

const app = express();
const PORT = 3001;

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor de diagnóstico funcionando',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de diagnóstico corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

console.log('📋 Servidor iniciado exitosamente');
