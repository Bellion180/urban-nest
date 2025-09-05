import express from 'express';

const app = express();
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Servidor mínimo funcionando' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Servidor mínimo en http://localhost:${PORT}`);
});

// Evitar que se cierre el servidor
process.on('SIGINT', () => {
  console.log('SIGINT recibido - manteniendo servidor activo');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido - manteniendo servidor activo');
});
