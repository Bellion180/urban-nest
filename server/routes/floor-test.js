import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Test endpoint
router.get('/floor-test', authMiddleware, async (req, res) => {
  res.json({ message: 'Floor test endpoint works!' });
});

export default router;
