import express from 'express';

const app = express();
const PORT = 3002; // Puerto diferente para evitar conflictos

app.use(express.json());

app.get('/test', (req, res) => {
  console.log('✅ Request recibida en servidor independiente');
  res.json({ message: 'Servidor independiente funcionando', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor independiente corriendo en http://localhost:${PORT}`);
});

// Manejo de errores
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
