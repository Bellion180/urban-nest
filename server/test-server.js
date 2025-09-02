import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002; // Puerto diferente para no conflicto

console.log('🔧 Starting test server...');

// CORS
app.use(cors());

// Logging middleware - DEBE ejecutarse
app.use((req, res, next) => {
  console.log(`\n🔍 LOG: ${req.method} ${req.url}`);
  console.log(`Headers:`, req.headers);
  console.log(`Body:`, req.body);
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test routes
app.get('/test', (req, res) => {
  console.log('📍 Inside /test handler');
  res.json({ message: 'Test GET works', timestamp: new Date().toISOString() });
});

app.put('/test/:id', (req, res) => {
  console.log('📍 Inside /test/:id PUT handler');
  console.log('ID:', req.params.id);
  console.log('Body:', req.body);
  res.json({ 
    message: 'Test PUT works', 
    id: req.params.id, 
    body: req.body, 
    timestamp: new Date().toISOString() 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error handler:', err);
  res.status(500).json({ error: 'Test server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`📊 Test GET: http://localhost:${PORT}/test`);
  console.log(`📊 Test PUT: http://localhost:${PORT}/test/123`);
});
