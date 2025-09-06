import express from 'express';

const router = express.Router();

// Ruta de prueba simple
router.post('/:id/payment', (req, res) => {
  console.log('💰 Ruta de payment funciona!');
  res.json({ message: 'Payment route works', id: req.params.id, body: req.body });
});

export default router;
